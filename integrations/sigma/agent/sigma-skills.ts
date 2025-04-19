/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIBaseSkills } from '@tegonhq/agent-sdk';
import axios from 'axios';

export class SigmaSkills extends APIBaseSkills {
  skills(): Record<string, any> {
    return {
      get_page: {
        description: 'Retrieve a specific page by its ID from the workspace',
        params: {
          page_id: {
            description: 'Unique identifier of the page to retrieve',
            required: true,
            type: 'string',
          },
        },
      },
      update_page: {
        description: 'Update an existing page in the workspace',
        params: {
          page_id: {
            description: 'Unique identifier of the page to update',
            required: true,
            type: 'string',
          },
          title: {
            description: 'New title for the page',
            required: false,
            type: 'string',
          },
          html_description: {
            description: 'Updated content for the page in tiptap HTML format',
            required: false,
            type: 'string',
          },
        },
      },
      delete_page: {
        description: 'Delete an existing page from the workspace',
        params: {
          page_id: {
            description: 'Unique identifier of the page to delete',
            required: true,
            type: 'string',
          },
        },
      },
      get_task_by_id: {
        description: 'Retrieve a task by its ID',
        params: {
          task_id: {
            description: 'Unique identifier of the task to retrieve',
            required: true,
            type: 'string',
          },
        },
      },
      create_task: {
        description: 'Create a new task',
        params: {
          title: {
            description: 'Title of the task',
            required: true,
            type: 'string',
          },
          status: {
            description: 'Status of the task',
            required: true,
            type: 'string',
            enum: ['Todo', 'In-progress', 'Done', 'Cancelled'],
          },
          parentId: {
            description: 'UUID of the parent task',
            required: false,
            type: 'string',
          },
          integrationAccountId: {
            description: 'Integration account ID',
            required: false,
            type: 'string',
          },
          pageDescription: {
            description: 'Description for the task page in tiptap HTML format',
            required: false,
            type: 'string',
          },
        },
      },
      update_task: {
        description: 'Update an existing task',
        params: {
          taskId: {
            description: 'Unique identifier of the task to update',
            required: true,
            type: 'string',
          },
          title: {
            description: 'New title for the task',
            required: false,
            type: 'string',
          },
          status: {
            description: 'Updated status of the task',
            required: false,
            type: 'string',
            enum: ['Todo', 'Done', 'Cancelled'],
          },
          pageDescription: {
            description: 'Description for the task page in tiptap HTML format',
            required: false,
            type: 'string',
          },
        },
      },
      delete_task: {
        description: 'Delete an existing task',
        params: {
          task_id: {
            description: 'Unique identifier of the task to delete',
            required: true,
            type: 'string',
          },
        },
      },
    };
  }

  getHeaders(
    integrationConfiguration: Record<string, string | number | boolean>,
  ): Record<string, string> {
    return {
      Authorization: `Bearer ${integrationConfiguration.accessToken as string}`,
    };
  }

  getBaseURL(): string {
    return 'https://app.mysigma.ai/api';
  }

  private async getPage(params: any): Promise<string> {
    const { page_id } = params;
    try {
      const response = await axios.get(`${this.getBaseURL()}/v1/pages/${page_id}`, {
        headers: this.headers,
      });
      const page = response.data;
      return `I've fetched the page with id '${page.id}', title '${page.title}', html_description '${page.description || 'None'}', pageType '${page.type}'`;
    } catch (error) {
      return `Error retrieving page: ${error.message}`;
    }
  }

  private async updatePage(params: any): Promise<string> {
    const { page_id, title, html_description } = params;
    const data: any = {};

    if (title !== undefined) {
      data.title = title;
    }
    if (html_description !== undefined) {
      data.htmlDescription = html_description;
    }

    try {
      const response = await axios.post(`${this.getBaseURL()}/v1/pages/${page_id}`, data, {
        headers: this.headers,
      });
      const page = response.data;
      return `I've updated the page with id '${page.id}'`;
    } catch (error) {
      return `Error updating page: ${error.message}`;
    }
  }

  private async deletePage(params: any): Promise<string> {
    const { page_id } = params;
    try {
      const response = await axios.delete(`${this.getBaseURL()}/v1/pages/${page_id}`, {
        headers: this.headers,
      });
      const page = response.data;
      return `I've deleted the page with id '${page.id}'`;
    } catch (error) {
      return `Error deleting page: ${error.message}`;
    }
  }

  private async getTaskById(params: any): Promise<string> {
    const { task_id } = params;
    try {
      const response = await axios.get(`${this.getBaseURL()}/v1/tasks/${task_id}`, {
        headers: this.headers,
      });
      const task = response.data;
      return `I've fetched the task with id '${task.id}' page_id '${task.pageId}' parent_id '${task.parentId || 'None'}' status '${task.status}' startTime '${task.startTime || 'None'}' endTime '${task.endTime || 'None'}' dueDate '${task.dueDate || 'None'}' remindAt '${task.remindAt || 'None'}' scheduleText '${task.scheduleText || 'None'}' recurrence '${task.recurrence || 'None'}'`;
    } catch (error) {
      return `Error retrieving task: ${error.message}`;
    }
  }

  private async createTask(params: any): Promise<string> {
    const { title, status, parentId, integrationAccountId, pageDescription } = params;
    const data: any = {
      title,
      status,
    };

    if (parentId) {
      data.parentId = parentId;
    }
    if (integrationAccountId) {
      data.integrationAccountId = integrationAccountId;
    }
    if (pageDescription) {
      data.pageDescription = pageDescription;
    }

    try {
      const response = await axios.post(`${this.getBaseURL()}/v1/tasks`, data, {
        headers: this.headers,
      });
      const task = response.data;
      return `I've created the task with id '${task.id}' title '${title}'`;
    } catch (error) {
      return `Error creating task: ${error.message}`;
    }
  }

  private async updateTask(params: any): Promise<string> {
    const { taskId, title, status, pageDescription } = params;
    const data: any = {};

    if (title !== undefined) {
      data.title = title;
    }
    if (status !== undefined) {
      data.status = status;
    }
    if (pageDescription !== undefined) {
      data.pageDescription = pageDescription;
    }

    try {
      const response = await axios.put(`${this.getBaseURL()}/v1/tasks/${taskId}`, data, {
        headers: this.headers,
      });
      const task = response.data;
      return `Task with ID '${task.id}' has been successfully updated.`;
    } catch (error) {
      return `Error updating task: ${error.message}`;
    }
  }

  private async deleteTask(params: any): Promise<string> {
    const { task_id } = params;
    try {
      await axios.delete(`${this.getBaseURL()}/v1/tasks/${task_id}`, {
        headers: this.headers,
      });
      return `Task with ID '${task_id}' has been successfully deleted.`;
    } catch (error) {
      return `Error deleting task: ${error.message}`;
    }
  }

  private functionMap: Record<string, (params: any) => Promise<string>> = {
    get_page: this.getPage.bind(this),
    update_page: this.updatePage.bind(this),
    delete_page: this.deletePage.bind(this),
    get_task_by_id: this.getTaskById.bind(this),
    create_task: this.createTask.bind(this),
    update_task: this.updateTask.bind(this),
    delete_task: this.deleteTask.bind(this),
  };

  async runSkill(skillName: string, parameters: any): Promise<string> {
    const func = this.functionMap[skillName];
    if (!func) {
      return `Unknown action: ${skillName} no action found`;
    }
    return func(parameters);
  }
}
