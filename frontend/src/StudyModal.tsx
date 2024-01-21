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
    VStack,
    StackDivider,
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
    const [BreakInput, setShortBreakInput] = useState('')
    const [amountInput, setAmountInput] = useState('')
    const [, setButtonClicked] = useState(false); 
    const [studyState, setStudyState] = useState('idle');

    const [studyProportion, setStudyProportion] = useState<number>()
    const [sittingLongestLength, setSittingLongestLength] = useState<number>()
    const [lookDownProportion, setLookDownProportion] = useState<number>()
    const [afkProportion, setAfkProportion] = useState<number>()
    const [afkLongestLength, setAfkLongestLength] = useState<number>()
    const [afkCount, setAfkCount] = useState<number>()

    const handleGoalInputChange = (e: any) => setGoalInput(e.target.value)
    const handleSessionInputChange = (e : any) => setSessionInput(e.target.value)
    const handleBreakInputChange = (e: any) => setShortBreakInput(e.target.value)
    const handleAmountInputChange = (e: any) => setAmountInput(e.target.value)

    const isGoalError = goalInput === ''
    const isSessionError = sessionInput === ''
    const isBreakError = BreakInput === ''
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
            setStudyProportion((Number(statistics.studyProportion.toFixed(4)))*100);
            setSittingLongestLength((Number(statistics.sittingLongestLength.toFixed(4))));
            setLookDownProportion((Number(statistics.lookDownProportion.toFixed(4)))*100);
            setAfkProportion((Number(statistics.afkProportion.toFixed(4)))*100);
            setAfkLongestLength((Number((statistics.afkLongestLength).toFixed(4))));
            setAfkCount(statistics.afkCount);
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
        <VStack
        divider={<StackDivider borderColor='gray.200' />}
        spacing={4}
        align='stretch'
        >
            <Center>
                <Text fontSize='3xl'>Study Stats:</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>Study Proportion: {studyProportion}%</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>Sitting Longest Length: {sittingLongestLength} secs</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>Look Down Proportion: {lookDownProportion}%</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>AFK Proportion: {afkProportion}%</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>AFK Longest Length: {afkLongestLength} secs</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>AFK Count: {afkCount} times</Text>
            </Center>
            <Center>
                <Button onClick={onOpen} size='lg' mt="10px">Start Studying Again!</Button>
            </Center>
        </VStack>
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
            <FormControl isInvalid={isBreakError}>
                <FormLabel>Break time:</FormLabel>
                <Input type='number' value={BreakInput} onChange={handleBreakInputChange} />
                {!isBreakError ? (
                    <FormHelperText>
                    Enter the time for your  break.
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Break time is required.</FormErrorMessage>
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
            <Button colorScheme='blue' mr={3} onClick={handleButtonClick} isDisabled={isGoalError || isAmountError || isBreakError || isSessionError}>
              Start Studying!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StudyModal