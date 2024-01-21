import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    FormHelperText,
    FormErrorMessage,
    Box,
    AbsoluteCenter,
    Center,
    Text,
    CircularProgress,
    CircularProgressLabel,
    HStack,
  } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import WebcamWrapper, { WebcamWrapperMethods } from './WebcamWrapper'
import useCountdown from './useCountdown'
import io from 'socket.io-client'

interface Statistics {
    studyProportion: number,
    lookDownProportion: number,
    afkProportion: number,
    afkCount: number,
    afkLongestLength: number,
    sittingLongestLength: number,
}

const socket = io('http://localhost:3001');
  
function StudyModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { secondsLeft, percentage, start } = useCountdown()
    
    const [goalInput, setGoalInput] = useState('')
    const [sessionInput, setSessionInput] = useState('')
    const [shortBreakInput, setShortBreakInput] = useState('')
    const [longBreakInput, setLongBreakInput] = useState('')
    const [amountInput, setAmountInput] = useState('')
    const [, setButtonClicked] = useState(false); 
    const [studyState, setStudyState] = useState('idle');

    const handleGoalInputChange = (e: any) => setGoalInput(e.target.value)
    const handleSessionInputChange = (e : any) => setSessionInput(e.target.value)
    const handleShortBreakInputChange = (e: any) => setShortBreakInput(e.target.value)
    const handleLongBreakInputChange = (e: any) => setLongBreakInput(e.target.value)
    const handleAmountInputChange = (e: any) => setAmountInput(e.target.value)

    const isGoalError = goalInput === ''
    const isSessionError = sessionInput === ''
    const isShortBreakError = shortBreakInput === ''
    const isLongBreakError = longBreakInput === ''
    const isAmountError = amountInput === ''

    const time = 60*(sessionInput as unknown as number);
    const handleButtonClick = () => {
        // Implement the logic to handle different states
        if (studyState === 'idle' || studyState === 'statistics') {
            setButtonClicked(true);
            onClose();
            setStudyState('studying');
            start(time)
        } else if (studyState === 'studying') {
            setGoalInput('');
            setSessionInput('');
            setShortBreakInput('');
            setLongBreakInput('');
            setAmountInput('');
            setStudyState('statistics');
        }
    }

    const webRef = useRef<WebcamWrapperMethods>(null);

    useEffect(() => {
        let interval;
        if (studyState === 'studying') {
            socket.emit('start_study');
            interval = setInterval(() => {
                if (studyState === 'studying') {
                    webRef.current?.capture();
                }
            });
        } else if (studyState === 'statistics') {
            clearInterval(interval);
            socket.emit('end_study');
        }
    }, [studyState])

    useEffect(() => {
        socket.on('study_session_end', (statistics: Statistics) => {
            console.log(statistics);
        });
    }, []);
    
  return (
    <>
      {studyState === 'idle' && (
        <Box position='relative' h='200px'>
            <AbsoluteCenter p='4' color='white' axis='both'>
                <Button onClick={onOpen} size='lg'>Start Studying</Button>
            </AbsoluteCenter>
        </Box>)}

      {studyState === 'studying' && (
      <Box>
        <Center>
            <HStack spacing='24px'>
                <CircularProgress value={percentage} color='green.400' size="100px">
                    <CircularProgressLabel>{secondsLeft}</CircularProgressLabel>
                </CircularProgress>
                <Text fontSize='4xl'> {"Goal: " + goalInput}</Text>
            </HStack>
        </Center>
        <Center>
            <WebcamWrapper ref={webRef}/>
        </Center>
        <Center mt="20px">
            <Button onClick={handleButtonClick} size='lg'>End Study Session</Button>
        </Center>
      </Box>)}

      {studyState === 'statistics' && (
        <Box>
            <Center>
                <Text fontSize='3xl'>Stats</Text>
            </Center>
            <Center>
                <Button onClick={onOpen} size='lg' mt="10px">Start Studying</Button>
            </Center>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choose your study settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={isGoalError}>
                <FormLabel>Goal</FormLabel>
                <Input type='string' value={goalInput} onChange={handleGoalInputChange} />
                {!isGoalError ? (
                    <FormHelperText>
                    Enter the goal have in mind for this study session.
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Goal is required.</FormErrorMessage>
                )}
            </FormControl>
            <FormControl isInvalid={isSessionError}>
                <FormLabel>Study Session</FormLabel>
                <Input type='number' value={sessionInput} onChange={handleSessionInputChange} />
                {!isSessionError ? (
                    <FormHelperText>
                    Enter time for your study session .
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Time for study session is required.</FormErrorMessage>
                )}
            </FormControl>
            <FormControl isInvalid={isShortBreakError}>
                <FormLabel>Short Break time:</FormLabel>
                <Input type='number' value={shortBreakInput} onChange={handleShortBreakInputChange} />
                {!isShortBreakError ? (
                    <FormHelperText>
                    Enter the time for your short break.
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Short break time is required.</FormErrorMessage>
                )}
            </FormControl>
            <FormControl isInvalid={isLongBreakError}>
                <FormLabel>Long Break time:</FormLabel>
                <Input type='number' value={longBreakInput} onChange={handleLongBreakInputChange} />
                {!isLongBreakError ? (
                    <FormHelperText>
                    Enter the time for your long break.
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Long break time is required.</FormErrorMessage>
                )}
            </FormControl>
            <FormControl isInvalid={isAmountError}>
                <FormLabel>Amount of Sessions:</FormLabel>
                <Input type='number' value={amountInput} onChange={handleAmountInputChange} />
                {!isAmountError ? (
                    <FormHelperText>
                    Enter the number of sessions you will study.
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Amount of sessions is required.</FormErrorMessage>
                )}
            </FormControl>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleButtonClick} isDisabled={isGoalError || isAmountError || isLongBreakError || isShortBreakError || isSessionError}>
              Start Studying!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StudyModal