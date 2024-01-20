import { Heading } from '@chakra-ui/react'
import StudyModal from './StudyModal'

function App() {
  return (
    <>
      <Heading
        fontSize={{ base: '4xl', sm: '5xl', md: '6xl' }}
        fontWeight="bold"
        textAlign="center"
        bgGradient="linear(to-l, #7928CA, #FF0080)"
        bgClip="text"
        mt={4}
      >
        Study with me!
      </Heading>
      <StudyModal />
    </>
  )
}

export default App
