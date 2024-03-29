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
    Image,
  } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import WebcamWrapper, { WebcamWrapperMethods } from './WebcamWrapper'
import useCountdown from './useCountdown'
import io from 'socket.io-client'
import logo from './assets/cramcam logo.png'

interface Statistics {
    studyProportion: number,
    lookDownProportion: number,
    afkProportion: number,
    afkCount: number,
    afkLongestLength: number,
    sittingLongestLength: number,
    averageDecibel: number,
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
    const [, setAfkCount] = useState<number>()
    const [averageDecibel, setAverageDecibel] = useState<number>()

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
            }, 150);
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
            setAfkLongestLength(Number((statistics.afkLongestLength).toFixed(4)));
            setAfkCount(statistics.afkCount);
            setAverageDecibel(Number((statistics.averageDecibel).toFixed(2)));
            
            console.log(statistics);
        });
    }, []);
    
  return (
    <>
      {studyState === 'idle' && (
        <><Box position='relative' h='200px'>
                  <AbsoluteCenter p='4' color='white' axis='both'>
                      <Button onClick={onOpen} size='lg'>Start Studying</Button>
                  </AbsoluteCenter>
              </Box>
                <Center p='4' color='white'>
                    <Image src={logo} alt='Dan Abramov' boxSize='400px'/>
                  </Center>
            </>
        )}

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
                <Text fontSize='lg'>Study Proportion: {studyProportion}%, Look Down Proportion: {lookDownProportion}%, AFK Proportion: {afkProportion}%</Text>
            </Center>
            <Center>
                <Text fontSize='lg'>Sitting: The longest time you spent sitting down was {sittingLongestLength} seconds.</Text>
            </Center>
            {sittingLongestLength !== undefined ? (
                sittingLongestLength < 600 ? (
                <Center>
                    <Text fontSize='lg'>You are frequently disrupting your flow state and breaking your concentration, lowering your quality of work. Consider extending your study periods.</Text>
                </Center>
                ) : (
                    <Center>
                    <Text fontSize='lg'>
                        Consider following the 30-30 rule where every 30 minutes, take a break for at least 30 seconds. During the break, it is recommended to stand up, stretch, or take a brief water break. This is to reduce eye strain, improve circulation, prevent burnout, and other health benefits!</Text>
                </Center>
                )
            ) : (
                <Text>Loading...</Text>
            )}
            <Center>
                <Text fontSize='lg'>AFK: The longest time you spent away from your keyboard was {afkLongestLength} seconds</Text>
            </Center>
            {afkLongestLength !== undefined ? (
                afkLongestLength < 600 ? (
                <Center>
                    <Text fontSize='lg'>This reduces your momentum, making it hard to pick up where you left off - leading to even more time wasted to regain your focus and mental energy.</Text>
                </Center>
                ) : (
                    <Center>
                    <Text fontSize='lg'>
                        Longer breaks (but not excessive) help substantially in maintaining focus and preventing burnout, which actually benefits you in the long run. 
                    </Text>
                </Center>
                )
            ) : (
                <Text>Loading...</Text>
            )}
            <Center>
                <Text fontSize='lg'>Sound: The volume of your surroundings is: {averageDecibel} decibels.</Text>
            </Center>
            {averageDecibel !== undefined ? (
                averageDecibel > 50 ? (
                <Center>
                    <Text fontSize='lg'> Your environment is very loud, which may distract you and put you out of your flow state.</Text>
                </Center>
                ) : (
                    <Center>
                    <Text fontSize='lg'>
                        You are in a good environment for learning as it is pretty quiet and allows you to focus well.
                    </Text>
                </Center>
                )
            ) : (
                <Text>Loading...</Text>
            )}
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
                <FormLabel>Goal:</FormLabel>
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
                <FormLabel>Time (in minutes):</FormLabel>
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
                <FormLabel>Break time (in minutes):</FormLabel>
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