let data = []

const formElem = document.querySelector('#form')
const listElem = document.querySelector('#list')

// -----------------------------------------------------------------
class ToDoSaver {
  constructor() {
    this.#init()
  }

  #init() {
    this.handleBeforeUnload = this.#handleBeforeUnload.bind(this)
    this.handleAfterReload = this.#handleAfterReload.bind(this)

    window.addEventListener('beforeunload', this.handleBeforeUnload)
    window.addEventListener('DOMContentLoaded', this.handleAfterReload)
  }

  #handleBeforeUnload() {
    const json = JSON.stringify(data)
    localStorage.setItem('data', json)
  }

  #handleAfterReload() {
    const dataStorage = localStorage.getItem('data')

    if (dataStorage) {
      data = JSON.parse(dataStorage)

      const eventRenderAfterReload = new Event('render:needAfterReload')
      window.dispatchEvent(eventRenderAfterReload)
    }
  }
}

// -----------------------------------------------------------------

class ToDoFormCreate {
  constructor(formElement) {
    this.formElement = formElement
    this.#init()
  }

  #init() {
    this.handleSubmit = this.#handleSubmit.bind(this)

    this.formElement.addEventListener('submit', this.handleSubmit)
  }

  #handleSubmit(event) {
    event.preventDefault()

    const todo = {
      id: new Date().getTime(),
      isCheked: false,
    }

    const formData = new FormData(formElem)
    for (let [name, value] of formData.entries()) {
      todo[name] = value
    }

    data.push(todo)
    formElem.reset()

    const eventRender = new Event('render:need')
    window.dispatchEvent(eventRender)
  }
}

// -----------------------------------------------------------------

class ToDoList {
  constructor(listElem) {
    this.listElem = listElem
    this.#init()
  }

  #init() {
    this.handleChange = this.#handleChange.bind(this)
    this.handleclickDelBtn = this.#handleclickDelBtn.bind(this)
    this.handleRenderNeed = this.#handleRenderNeed.bind(this)

    this.listElem.addEventListener('change', this.handleChange)
    this.listElem.addEventListener('click', this.handleclickDelBtn)
    window.addEventListener('render:need', this.handleRenderNeed)
    window.addEventListener('render:needEditListElem', this.handleRenderNeed)
    window.addEventListener('render:needAfterReload', this.handleRenderNeed)
  }

  #handleChange(event) {
    const { target } = event
    const { id, checked, type } = target

    if (type != 'checkbox') return

    data.forEach((item) => {
      if (item.id == id) {
        item.isChecked = checked
      }
    })

    this.render()
  }

  #handleclickDelBtn(event) {
    const { role, id } = event.target.dataset

    if (role == 'delete') {
      data = data.filter((item) => item.id != id)

      this.render()
    }
  }

  #handleRenderNeed() {
    this.render()
  }

  template({ id, todo_content, isChecked }) {
    const checkedAttr = isChecked ? 'checked' : ''

    const template = `
      <li class="d-flex p-2 border border-1 rounded-3 ${checkedAttr}">
    
        <div class="form-check form-check-lg d-flex flex-grow-1 align-items-center">
          <input class="form-check-input mt-0 me-2" ${checkedAttr} type="checkbox" id="${id}">
          <label class="form-check-label" for="${id}">${todo_content}</label>
        </div>
    
        <button type="button" data-role="edit" data-id="${id}" class="btn btn-sm btn-primary me-2">
          <svg class="pe-none" width="16" height="16"><use href="#pencil"/></svg>
        </button>
    
        <button type="button" data-role="delete" data-id="${id}" class="btn btn-sm btn-danger ms-auto">
          <svg class="pe-none" width="16" height="16"><use href="#trash"/></svg>
        </button>
    
      </li>
    `
    return template
  }

  toDoElements() {
    let result = ''

    data.forEach((todo) => {
      result = result + this.template(todo)
    })

    return result
  }

  render() {
    const todoElements = this.toDoElements()
    this.listElem.innerHTML = todoElements
  }
}

// -----------------------------------------------------------------------

class ToDoListEdit {
  editedTodo = {}
  isEdit = false

  constructor(listElem) {
    this.listElem = listElem
    this.#init()
  }

  #init() {
    this.handleClickEditBtn = this.#handleClickEditBtn.bind(this)
    this.handleTodoEditSubm = this.#handleTodoEditSubm.bind(this)
    this.handleClickCancelBtn = this.#handleClickCancelBtn.bind(this)

    this.listElem.addEventListener('click', this.handleClickEditBtn)
    this.listElem.addEventListener('submit', this.handleTodoEditSubm)
    this.listElem.addEventListener('click', this.handleClickCancelBtn)
  }

  #handleClickEditBtn(event) {
    const { target } = event
    const { role, id } = target.dataset

    if (role == 'edit') {
      if (this.isEdit == true) {
        alert('finish editing')
        return
      }

      data.forEach((item) => {
        if (item.id == id) {
          this.editedTodo = item

          const { parentElement } = target
          const editTodo = this.template(item)

          parentElement.outerHTML = editTodo

          this.isEdit = true
        }
      })
    }
  }

  #handleTodoEditSubm(event) {
    event.preventDefault()

    const { target } = event
    const { role } = target.dataset

    if (role == 'todoEdit') {
      const editedContent = target.querySelector('[name="content"]').value

      this.editedTodo.todo_content = editedContent

      this.renderEditListElem()

      this.isEdit = false
    }
  }

  #handleClickCancelBtn(event) {
    const { role } = event.target.dataset
    if (role == 'cancelEdit') {
      this.renderEditListElem()

      this.isEdit = false
    }
  }

  template({ todo_content }) {
    const template = `
  <form class="d-flex p-2 border border-1 rounded-3" data-role="todoEdit">

    <div class="flex-grow-1 me-3">
      <input type="text" class="form-control form-control-sm" placeholder="edit a task" name="content" required value="${todo_content}">
    </div>

    <button type="submit" class="btn btn-sm btn-success">
      <svg class="pe-none" width="16" height="16">
        <use href="#confirm" />
      </svg>
    </button>

    <button type="button" data-role="cancelEdit" class="btn btn-sm btn-warning ms-2">
      <svg class="pe-none" width="16" height="16">
        <use href="#cancel" />
      </svg>
    </button>

  </form>
`
    return template
  }

  renderEditListElem() {
    const eventRenderEditlistElem = new Event('render:needEditListElem')
    window.dispatchEvent(eventRenderEditlistElem)
  }
}

// --------------------------------------------------------------------------------

new ToDoFormCreate(formElem)
new ToDoList(listElem)
new ToDoListEdit(listElem)
new ToDoSaver()
