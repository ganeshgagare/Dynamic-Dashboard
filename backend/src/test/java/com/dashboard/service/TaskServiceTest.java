package com.dashboard.service;

import com.dashboard.model.Task;
import com.dashboard.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repo;

    @InjectMocks
    private TaskService taskService;

    @Test
    void getAll_returnsAllTasks() {
        List<Task> tasks = List.of(
                new Task("T1", "Completed", LocalDate.now(), "Dev", 200),
                new Task("T2", "Pending",   LocalDate.now(), "QA",  100)
        );
        when(repo.findAll()).thenReturn(tasks);

        List<Task> result = taskService.getAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("T1");
    }

    @Test
    void save_delegatesToRepository() {
        Task task = new Task("New Task", "Pending", LocalDate.now(), "Design", 500);
        when(repo.save(task)).thenReturn(task);

        Task saved = taskService.save(task);

        assertThat(saved.getName()).isEqualTo("New Task");
        verify(repo).save(task);
    }

    @Test
    void delete_callsDeleteById() {
        taskService.delete(42L);
        verify(repo).deleteById(42L);
    }

    @Test
    void getFiltered_withStatus_callsRepository() {
        when(repo.findFiltered(eq("Completed"), isNull(), isNull(), isNull()))
                .thenReturn(List.of());

        List<Task> result = taskService.getFiltered("Completed", null, null, null);

        assertThat(result).isEmpty();
        verify(repo).findFiltered("Completed", null, null, null);
    }
}
