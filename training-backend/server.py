import os
import yt_dlp
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
import requests
import random
import ffmpeg

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            videoId TEXT,
            start REAL,
            end REAL,
            audioSets TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS most_replayed_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            videoId TEXT,
            startMillis INTEGER,
            intensityScoreNormalized REAL,
            UNIQUE(videoId, startMillis)
        )
    ''')
    conn.commit()
    conn.close()

# Create a connection to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# API endpoint to purge the table
@app.route('/api/purge', methods=['POST'])
def purge_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM exports')
    conn.commit()
    conn.close()

    return jsonify({'message': 'Table purged successfully'})


# API endpoint to export data as JSON
@app.route('/api/jsonexport', methods=['POST'])
def export_json():
    process_table()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT videoId, id, audioSets FROM exports')
    entries = cursor.fetchall()
    conn.close()

    train_src_folder = "train_src"
    json_folder = "json"

    if not os.path.exists(json_folder):
        os.makedirs(json_folder)

    data = []

    for entry in entries:
        video_id = entry['videoId']
        entry_id = entry['id']
        labels = entry['audioSets']

        wav_path = os.path.join(train_src_folder, f"{video_id}_{entry_id}.flac")

        if os.path.exists(wav_path):
            data.append({
                "video_id": f"{video_id}_{entry_id}",
                "wav": wav_path,
                "labels": labels
            })

    random.shuffle(data)
    eval_size = int(len(data) * 0.1)

    eval_data = data[:eval_size]
    train_data = data[eval_size:]

    train_json_data = {"data": train_data}
    eval_json_data = {"data": eval_data}

    with open(os.path.join(json_folder, "training.json"), "w") as file:
        json.dump(train_json_data, file, indent=4)

    with open(os.path.join(json_folder, "eval.json"), "w") as file:
        json.dump(eval_json_data, file, indent=4)

    return jsonify({'message': 'JSON export completed successfully'})

# API endpoint to process the table
@app.route('/api/process', methods=['POST'])
def process_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT videoId FROM exports')
    video_ids = [row['videoId'] for row in cursor.fetchall()]
    
    audio_src_folder = "audio_src"
    train_src_folder = "train_src"
    
    if not os.path.exists(audio_src_folder):
        os.makedirs(audio_src_folder)
    
    if not os.path.exists(train_src_folder):
        os.makedirs(train_src_folder)
    
    for video_id in video_ids:
        video_path = os.path.join(audio_src_folder, f"{video_id}.m4a")
        if not os.path.exists(video_path):
            download_audio(f"https://www.youtube.com/watch?v={video_id}", audio_src_folder)
        
        cursor.execute('SELECT id, start, end FROM exports WHERE videoId = ?', (video_id,))
        entries = cursor.fetchall()
        
        for entry in entries:
            entry_id = entry['id']
            start_time = entry['start']
            end_time = entry['end']
            flac_path = os.path.join(train_src_folder, f"{video_id}_{entry_id}.flac")
            
            if not os.path.exists(flac_path):
                clip_audio(video_path, start_time, end_time, flac_path)
    
    conn.close()
    
    return jsonify({'message': 'Table processed successfully'})

# API endpoint to fetch most replayed data
@app.route('/api/most-replayed', methods=['GET'])
def get_most_replayed_data():
    video_id = request.args.get('videoId')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM most_replayed_data WHERE videoId = ?', (video_id,))
    data = cursor.fetchall()
    conn.close()

    if data:
        return jsonify([dict(row) for row in data])
    else:
        print("Fetching Data from LemnosLife")
        url = f"https://yt.lemnoslife.com/videos?part=mostReplayed&id={video_id}"
        response = requests.get(url)
        data = response.json()

        print(data)

        if 'items' in data and data["items"][0]['mostReplayed'] is not None:
            most_replayed_data = data['items'][0]['mostReplayed']['markers']

            conn = get_db_connection()
            cursor = conn.cursor()
            for entry in most_replayed_data:
                cursor.execute('''
                    INSERT OR IGNORE INTO most_replayed_data (videoId, startMillis, intensityScoreNormalized)
                    VALUES (?, ?, ?)
                ''', (video_id, entry['startMillis'], entry['intensityScoreNormalized']))
            conn.commit()
            conn.close()

            return jsonify(most_replayed_data)
        else:
            return jsonify([])

# API endpoint to handle the exported data
@app.route('/api/export', methods=['POST'])
def export_data():
    data = request.get_json()
    video_id = data['videoId']
    start = data['start']
    end = data['end']
    audio_sets = ','.join(data['audioSets'])

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO exports (videoId, start, end, audioSets)
        VALUES (?, ?, ?, ?)
    ''', (video_id, start, end, audio_sets))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Data exported successfully'})

def download_audio(url, output_folder):
    # Extract the video ID from the URL
    video_id = extract_video_id(url)

    # Set the output path for the downloaded video
    audio_output_path = os.path.join(output_folder, f"{video_id}.m4a")

    # Configure the YouTube downloader options
    ydl_opts = {
        "format": "ba[ext=m4a]",
        "outtmpl": audio_output_path,
    }

    # Download the video with yt_dlp
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    print(f"Video downloaded successfully: {audio_output_path}")

def extract_video_id(url):
    """Extract the video ID from a YouTube URL."""
    return url.split("v=")[-1].split("&")[0]


def clip_audio(video_path, start_time, end_time, output_path):
    input_audio = ffmpeg.input(video_path)
    clipped_audio = input_audio.audio.filter('atrim', start=start_time, end=end_time)
    output = ffmpeg.output(clipped_audio, output_path, format='flac')
    ffmpeg.run(output, overwrite_output=True)


if __name__ == '__main__':
    create_tables()
    app.run(port=5000)