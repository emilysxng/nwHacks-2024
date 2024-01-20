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
  } from '@chakra-ui/react'
import { useState } from 'react'
  
function StudyModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const [goalInput, setGoalInput] = useState('')
    const [sessionInput, setSessionInput] = useState('')
    const [shortBreakInput, setShortBreakInput] = useState('')
    const [longBreakInput, setLongBreakInput] = useState('')
    const [amountInput, setAmountInput] = useState('')

    const handleGoalInputChange = (e) => setGoalInput(e.target.value)
    const handleSessionInputChange = (e) => setSessionInput(e.target.value)
    const handleShortBreakInputChange = (e) => setShortBreakInput(e.target.value)
    const handleLongBreakInputChange = (e) => setLongBreakInput(e.target.value)
    const handleAmountInputChange = (e) => setAmountInput(e.target.value)

    const isGoalError = goalInput === ''
    const isSessionError = sessionInput === ''
    const isShortBreakError = shortBreakInput === ''
    const isLongBreakError = longBreakInput === ''
    const isAmountError = amountInput === ''

    //close modal and reset form after adding bookmark 
    const closeEverything = () => { 
        onClose();
        setGoalInput('');
        setSessionInput('');
        setShortBreakInput('');
        setLongBreakInput('');
        setAmountInput('');
    }
    
  return (
    <>
      <Box position='relative' h='200px'>
        <AbsoluteCenter p='4' color='white' axis='both'>
            <Button onClick={onOpen} size='lg'>Open Modal</Button>
        </AbsoluteCenter>
      </Box>

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
                <Input type='int' value={sessionInput} onChange={handleSessionInputChange} />
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
                <Input type='int' value={shortBreakInput} onChange={handleShortBreakInputChange} />
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
                <Input type='int' value={longBreakInput} onChange={handleLongBreakInputChange} />
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
                <Input type='int' value={amountInput} onChange={handleAmountInputChange} />
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
            <Button colorScheme='blue' mr={3} onClick={closeEverything}>
              Start Studying!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StudyModal