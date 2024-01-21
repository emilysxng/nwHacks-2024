import pyaudio
from statistics import mean
import wave
import numpy as np
import wavio
import math

def measure_decibels():
    chunk = 1024
    sample_format = pyaudio.paInt16  # 16 bits per sample
    channels = 2
    fs = 44100
    filename = "output.wav"
    p = pyaudio.PyAudio()  # Create an interface to PortAudio

    print('Recording')

    stream = p.open(format=sample_format,
                    channels=channels,
                    rate=fs,
                    frames_per_buffer=chunk,
                    input=True)

    frames = []  # Initialize array to store frames

    try:
        while True:
            data = stream.read(chunk)
            frames.append(data)
    except:
        KeyboardInterrupt

    #where they should join``
    ################################################

    # Stop and close the stream 
    stream.stop_stream()
    stream.close()
    # Terminate the PortAudio interface
    p.terminate()

    print('Finished recording')

    # Save the recorded data as a WAV file
    wf = wave.open(filename, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(sample_format))
    wf.setframerate(fs)
    wf.writeframes(b''.join(frames))
    wf.close()

    # Load the .wav file
    wav_data = wavio.read(filename)

    # Extract audio data from the wavio.Wav object
    audio_data = wav_data.data.T[0]  # Extract the first channel

    chunks = np.array_split(audio_data, audio_data.size/(44100/2))
    dbs = [20*math.log10(np.abs(math.sqrt(mean(chunk**2))) ) for chunk in chunks] #half second chunks
    dbs = mean(dbs)
    print(dbs)

