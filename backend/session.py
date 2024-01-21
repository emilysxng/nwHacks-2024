import time
from enum import Enum

class Classification(Enum):
    STUDY = 1
    DISTRACTED = 2
    AFK = 3

class Session:
    def __init__(self) -> None:
        self.__studyFrameCount = 0
        self.__distrFrameCount = 0
        self.__afkFrameCount = 0
        self.__totalFrameCount = 0
        self.__startTime = None
        self.__stopTime = None
        self.__classCounts = {
            Classification.STUDY: 0,
            Classification.DISTRACTED: 0,
            Classification.AFK: 0
        }
        self.__maxClassCounts = {
            Classification.STUDY: 0,
            Classification.DISTRACTED: 0,
            Classification.AFK: 0
        }
        self.__afkCount = 0;

    def get_afk_count(self):
        return self.__afkCount

    def reset_class_count(self):
        if self.__classCounts[Classification.STUDY] > self.__maxClassCounts[Classification.STUDY]:
            self.__maxClassCounts[Classification.STUDY] = self.__classCounts[Classification.STUDY]
        if self.__classCounts[Classification.DISTRACTED] > self.__maxClassCounts[Classification.DISTRACTED]:
            self.__maxClassCounts[Classification.DISTRACTED] = self.__classCounts[Classification.DISTRACTED]
        if self.__classCounts[Classification.AFK] > self.__maxClassCounts[Classification.AFK]:
            self.__maxClassCounts[Classification.AFK] = self.__classCounts[Classification.AFK]
        if self.__classCounts[Classification.AFK] > 0:
            self.__afkCount += 1
        self.__classCounts = {
            Classification.STUDY: 0,
            Classification.DISTRACTED: 0,
            Classification.AFK: 0
        }

    def get_study_frame_count(self):
        return self.__studyFrameCount

    def get_distr_frame_count(self):
        return self.__distrFrameCount

    def get_afk_frame_count(self):
        return self.__afkFrameCount

    def get_total_frame_count(self):
        return self.__totalFrameCount

    def get_start_time(self):
        return self.__startTime

    def get_stop_time(self):
        return self.__stopTime

    def increment_study_frame_count(self):
        self.__studyFrameCount += 1

    def increment_distr_frame_count(self):
        self.__distrFrameCount += 1

    def increment_afk_frame_count(self):
        self.__afkFrameCount += 1

    def increment_total_frame_count(self):
        self.__totalFrameCount += 1

    def start_stopwatch(self):
        if self.__startTime is not None:
            return
        self.__startTime = time.time()

    def stop_stopwatch(self):
        if self.__startTime is None or self.__stopTime is not None:
            return
        self.__stopTime = time.time()

    def get_elapsed_time(self):
        if self.__startTime is not None and self.__stopTime is not None:
            return self.__stopTime - self.__startTime
        else:
            return None

    def increment_class_count(self, classification):
        if classification in self.__classCounts:
            self.__classCounts[classification] += 1

    def get_max_class_count(self, classification):
        return self.__maxClassCounts[classification]
