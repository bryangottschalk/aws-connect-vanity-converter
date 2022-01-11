import styled from 'styled-components';
import VanityNumberTable from './components/VanityNumberTable/VanityNumberTable';

const Container = styled.div`
  height: 100vh;
  background-color: #282c34;
`;

function App() {
  return (
    <Container>
      <VanityNumberTable />
    </Container>
  );
}

export default App;
