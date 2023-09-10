import { List, ListItem, ListItemIcon } from '@mui/material';
import Grid from '@mui/material/Grid';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const TaskItem = ({task}) => {
  const paramsList = task.params.map(param => {
    return <ListItem>{param}</ListItem>
  })
  const sentIcon = task.sent ? (<CheckBoxIcon />) : (<CheckBoxOutlineBlankIcon />)
  return (
      <ListItem className={"listElement"} key={task.order}>
        <ListItemIcon>
          {sentIcon}
        </ListItemIcon>
        <Grid item xs={4}>
          <h4>Order: {task.order}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>Type: {task.taskType}</h4>
        </Grid>
        <Grid item xs={4}>
          <h4>Params:</h4>
          <List>
            {paramsList}
          </List>
        </Grid>
      </ListItem>
    )
}

export default TaskItem