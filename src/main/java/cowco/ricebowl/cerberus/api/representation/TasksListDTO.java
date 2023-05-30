package cowco.ricebowl.cerberus.api.representation;

import java.util.ArrayList;
import java.util.List;

public class TasksListDTO {
    private List<String> tasks;	// XXX Placeholder until tasks are implemented
    
    public TasksListDTO() {
        tasks = new ArrayList<>();
    }
    
    public TasksListDTO(List<String> tasks) {
        this.tasks = tasks;
    }

    public List<String> getTasks() {
        return tasks;
    }

    public void setTasks(List<String> tasks) {
        this.tasks = tasks;
    }
    
    public void appendTask(String task) {
        this.tasks.add(task);
    }
}
