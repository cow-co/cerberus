import Container from '@mui/material/Container';

function TasksPane({selectedImplant}) {
  console.log("Rendering with implant: " + JSON.stringify(selectedImplant))
  return (
    <Container fixed>
      <h2>Tasks for {selectedImplant.id}</h2>
    </Container>
  )
}

export default TasksPane;