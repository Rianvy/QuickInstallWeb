// AppManager: управление данными приложений
class AppManager {
  constructor() {
    this.apps = [];
  }

  addApp(app) {
    this.apps.push(app);
  }

  clearApps() {
    this.apps = [];
  }

  toJSON() {
    return JSON.stringify(this.apps, null, 2);
  }

  static validateApp(app) {
    if (!app.Name || app.Tags.length === 0) {
      throw new Error('Each application must have a name and at least one tag.');
    }

    if (!app.Architectures['32-bit'] && !app.Architectures['64-bit']) {
      throw new Error('Each application must have at least one URL (32-bit or 64-bit).');
    }
  }
}

// AppField: создание и управление полями ввода для приложения
class AppField {
  constructor(index) {
    this.index = index;
  }

  generateHTML() {
    return `
      <div class="app-group p-4 border border-gray-700 rounded mb-4 bg-gray-800" data-index="${this.index}">
        <h3 class="text-lg font-bold mb-2 text-gray-100">Application ${this.index}</h3>
        <input type="text" name="name-${this.index}" placeholder="Application Name" class="p-2 border border-gray-700 rounded w-full mb-2 bg-gray-900 text-gray-100" required />
        <input type="url" name="url32-${this.index}" placeholder="32-bit URL" class="p-2 border border-gray-700 rounded w-full mb-2 bg-gray-900 text-gray-100" />
        <input type="url" name="url64-${this.index}" placeholder="64-bit URL" class="p-2 border border-gray-700 rounded w-full mb-2 bg-gray-900 text-gray-100" />
        <input type="text" name="arguments-${this.index}" placeholder="Arguments (e.g., /silent /install)" class="p-2 border border-gray-700 rounded w-full mb-2 bg-gray-900 text-gray-100" />
        <input type="text" name="tags-${this.index}" placeholder="Tags (comma-separated)" class="p-2 border border-gray-700 rounded w-full mb-2 bg-gray-900 text-gray-100" required />
      </div>
    `;
  }

  static extractData(group, index) {
    const name = group.querySelector(`input[name="name-${index}"]`)?.value.trim();
    const url32 = group.querySelector(`input[name="url32-${index}"]`)?.value.trim();
    const url64 = group.querySelector(`input[name="url64-${index}"]`)?.value.trim();
    const argumentsValue = group.querySelector(`input[name="arguments-${index}"]`)?.value.trim();
    const tagsInput = group.querySelector(`input[name="tags-${index}"]`)?.value.trim();

    if (!name || !tagsInput) return null;

    const tags = tagsInput.split(',').map(tag => tag.trim());
    const app = {
      Name: name,
      Architectures: {},
      Tags: tags,
    };

    if (url32) app.Architectures['32-bit'] = url32;
    if (url64) app.Architectures['64-bit'] = url64;
    if (argumentsValue) app.Arguments = argumentsValue;

    return app;
  }
}

// FormHandler: взаимодействие с интерфейсом
class FormHandler {
  constructor(form, appFieldsContainer, jsonOutputContainer, jsonOutput, downloadButton, addAppButton) {
    this.form = form;
    this.appFieldsContainer = appFieldsContainer;
    this.jsonOutputContainer = jsonOutputContainer;
    this.jsonOutput = jsonOutput;
    this.downloadButton = downloadButton;
    this.addAppButton = addAppButton;
    this.appManager = new AppManager();
    this.appCount = 0;

    this.initialize();
  }

  initialize() {
    this.jsonOutputContainer.style.display = 'none';
    this.addAppField();

    this.addAppButton.addEventListener('click', () => this.addAppField());
    this.form.addEventListener('submit', event => this.handleFormSubmit(event));
    this.downloadButton.addEventListener('click', () => this.downloadJSON());
  }

  addAppField() {
    this.appCount++;
    const appField = new AppField(this.appCount);
    this.appFieldsContainer.insertAdjacentHTML('beforeend', appField.generateHTML());
  }

  handleFormSubmit(event) {
    event.preventDefault();

    const appGroups = document.querySelectorAll('.app-group');
    this.appManager.clearApps();

    try {
      appGroups.forEach((group, index) => {
        const appData = AppField.extractData(group, index + 1);
        if (appData) {
          AppManager.validateApp(appData);
          this.appManager.addApp(appData);
        }
      });

      this.updateJSONOutput();
    } catch (error) {
      alert(error.message);
    }
  }

  updateJSONOutput() {
    this.jsonOutput.textContent = this.appManager.toJSON();
    this.jsonOutputContainer.style.display = 'block';
  }

  downloadJSON() {
    const blob = new Blob([this.appManager.toJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'programs.json';
    link.click();

    URL.revokeObjectURL(url);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('app-form');
  const appFieldsContainer = document.getElementById('app-fields');
  const jsonOutputContainer = document.getElementById('output');
  const jsonOutput = document.getElementById('json-output');
  const downloadButton = document.getElementById('download-json');
  const addAppButton = document.getElementById('add-app-button');

  new FormHandler(form, appFieldsContainer, jsonOutputContainer, jsonOutput, downloadButton, addAppButton);
});