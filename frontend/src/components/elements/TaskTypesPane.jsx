import { Button, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskTypeItem from './TaskTypeItem';
import { createTaskType, deleteTaskType } from '../../common/apiCalls';
import CreateTaskTypeDialogue from './CreateTaskTypeDialogue';
import { useSelector } from "react-redux";
import { createErrorAlert, createSuccessAlert, loadTaskTypes } from '../../common/redux/dispatchers';

function TaskTypesPane() {
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const taskTypes = useSelector((state) => state.tasks.taskTypes);

  const handleFormOpen = () => {
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    const response = await createTaskType(data);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
      handleFormClose();
      await loadTaskTypes();
      createSuccessAlert("Successfully created task type");
    }
  }

  const handleDelete = async (taskType) => {
    const { errors } = await deleteTaskType(taskType._id);

    if (errors.length > 0) {
      createErrorAlert(errors);
    } else {
      await loadTaskTypes();
      createSuccessAlert("Successfully deleted task type");
    }

  }

  useEffect(() => {
    async function callFetcher() {
      await loadTaskTypes();
    }
    callFetcher()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let taskTypesItems = null;

  if (taskTypes !== undefined && taskTypes !== null) {
    taskTypesItems = taskTypes.map(taskType => {
      return <TaskTypeItem taskType={taskType} key={taskType.order} deleteTaskType={() => handleDelete(taskType)} />
    });
  }

  return (
    <Container fixed>
      <Typography align="center" variant="h3">Task Types</Typography>
      <List>
        {taskTypesItems}
      </List>
      <Button variant='contained' onClick={handleFormOpen}>Create Task Type</Button>
      <CreateTaskTypeDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    </Container>
      
  )
}

export default TaskTypesPane;