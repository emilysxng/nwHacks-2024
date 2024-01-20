import soundmeter
from statistics import mean

def measure_decibels():
    meter = soundmeter.Meter()
    meter.start()

    print("Measuring decibels. Press Ctrl+C to stop.")

    try:
        while True:
            decibels = []
            decibels.append(meter.get_db())
            print(f"Current decibel level: {decibels:.2f} dB")
    except KeyboardInterrupt:
        meter.stop()
        avgDecibels = mean(decibels)
        print(f"\nAverage decibel level: {avgDecibels:.2f} dB")
