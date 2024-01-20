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
  } from '@chakra-ui/react'
import { useState } from 'react'
  
function StudyModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [input, setInput] = useState('')
    const handleInputChange = (e) => setInput(e.target.value)
    const isError = input === ''
    
  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={isError}>
                <FormLabel>Email</FormLabel>
                <Input type='email' value={input} onChange={handleInputChange} />
                {!isError ? (
                    <FormHelperText>
                    Enter the email you'd like to receive the newsletter on.
                    </FormHelperText>
                ) : (
                    <FormErrorMessage>Email is required.</FormErrorMessage>
                )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Start Studying!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StudyModal