import pyaudio
from statistics import mean
import wave
import numpy as np
import wavio
import math
import scipy.io.wavfile as wav

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
   # wav_data = wavio.read(filename)

    # Extract audio data from the wavio.Wav object
   # audio_data = wav_data.data.T[0]  # Extract the first channel
    sample_rate, wav_data = wav.read("output.wav")

    max_amplitude = np.max(np.abs(wav_data))

    wav_data_normalized = wav_data / max_amplitude

    average_decibel = -20 * np.log10(np.sqrt(np.mean((wav_data_normalized.astype(np.float64) / max_amplitude)**2)))
    print(average_decibel)

