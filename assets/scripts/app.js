class DomHelper {
  static clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }
  static moveElement(elementId, newDestinationId) {
    const element = document.getElementById(elementId);
    const destination = document.querySelector(newDestinationId);
    destination.append(element);
    element.scrollIntoView({ behavior: "smooth" });
  }
}

class Component {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }
  attach() {
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? "afterbegin" : "beforeend",
      this.element
    );
  }

  detach() {
    if (!this.element) {
      return;
    }
    this.element.remove();
  }
}

class Tooltip extends Component {
  constructor(closeNotifierFunction, tooltipText, hostElementId) {
    super(hostElementId);
    this.closeNotifier = closeNotifierFunction;
    this.tooltipText = tooltipText;
    this.create();
  }

  create() {
    const tooltipElement = document.createElement("div");
    tooltipElement.className = "card";
    const tooltipTemplate = document.getElementById("tooltip");
    const tooltipBody = document.importNode(tooltipTemplate.content, true);
    tooltipBody.querySelector("p").textContent = this.tooltipText;
    tooltipElement.append(tooltipBody);

    const hostElPos = this.hostElement.getBoundingClientRect();
    const hostElPosLeft = this.hostElement.offsetLeft;
    const hostElPosTop = this.hostElement.offsetTop;
    const hostElPosHeight = this.hostElement.offsetHeight;
    const parentElScrolling = this.hostElement.parentElement.scrollTop;
    console.log(hostElPos);
    const x = hostElPosLeft + 20;
    const y = hostElPosTop + hostElPosHeight - parentElScrolling - 10;
    tooltipElement.style.position = "absolute";
    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
    tooltipElement.addEventListener("click", this.closeTooltip);
    this.element = tooltipElement;
  }

  closeTooltip = () => {
    this.detach();
    this.closeNotifier();
  };
}

class ProjectItem {
  hasActiveTooltip = false;
  constructor(id, updateProjectListsFunction) {
    this.updateProjectListsFunctionHandler = updateProjectListsFunction;
    this.id = id;
    this.connectMoreInfoButton();
    this.connectSwitchButton();
  }

  connectMoreInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    const moreInfoButton = projectItemElement.querySelector(
      "button:first-of-type"
    );
    moreInfoButton.addEventListener(
      "click",
      this.showMoreInfoHandler.bind(this)
    );
  }

  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }
    const projectItemElement = document.getElementById(this.id);
    const tooltipText = projectItemElement.dataset.extraInfo;
    const tooltip = new Tooltip(
      () => {
        this.hasActiveTooltip = false;
      },
      tooltipText,
      this.id
    );
    tooltip.attach();
    this.hasActiveTooltip = true;
  }

  connectSwitchButton() {
    const projectItemElement = document.getElementById(this.id);
    let switchButton = projectItemElement.querySelector("button:last-of-type");
    switchButton = DomHelper.clearEventListeners(switchButton);
    switchButton.addEventListener(
      "click",
      this.updateProjectListsFunctionHandler.bind(null, this.id)
    );
  }

  update(updateProjectListsFunction, type) {
    this.updateProjectListsFunctionHandler = updateProjectListsFunction;
    const projectItemElement = document.getElementById(this.id);
    projectItemElement.querySelector("button:last-of-type").textContent =
      type === "active" ? "Finish" : "Activate";

    this.connectSwitchButton();
  }
}

class ProjectList {
  projects = [];
  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(
        new ProjectItem(prjItem.id, this.switchProject.bind(this))
      );
    }
    console.log(this.projects);
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }
  addProject(project) {
    this.projects.push(project);
    console.log(this.projects);

    DomHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projectId) {
    const projectIndex = this.projects.findIndex(
      (project) => project.id === projectId
    );
    const projectToSwitch = this.projects[projectIndex];
    console.log(projectId);
    this.projects.splice(projectIndex, 1);
    this.switchHandler(projectToSwitch);
  }
}

class App {
  static init() {
    const activeProjectList = new ProjectList("active");
    const finishedProjectList = new ProjectList("finished");
    activeProjectList.setSwitchHandlerFunction(
      finishedProjectList.addProject.bind(finishedProjectList)
    );
    finishedProjectList.setSwitchHandlerFunction(
      activeProjectList.addProject.bind(activeProjectList)
    );
  }
  static startAnalitics() {
    const someScript = document.createElement("script");
    someScript.src = "assets/scripts/analytics.js";

    document.head.append(someScript);
  }
}

App.init();
