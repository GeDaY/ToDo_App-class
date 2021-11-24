let data = []
let editedTodo = {}
let isEdit = false

const formElem = document.querySelector('#form')
const listElem = document.querySelector('#list')

function handleSubmit(event) {
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

  render()
}

function handleChange(event) {
  const { target } = event
  const { id, checked, type } = target

  if (type != 'checkbox') return

  data.forEach((item) => {
    if (item.id == id) {
      item.isChecked = checked
    }
  })

  render()
}

function handleBeforeUnload() {
  const json = JSON.stringify(data)
  localStorage.setItem('data', json)
}

function handleAfterReload() {
  const dataStorage = localStorage.getItem('data')

  if (dataStorage) {
    data = JSON.parse(dataStorage)

    render()
  }
}

function handleclickDelBtn(event) {
  const { role, id } = event.target.dataset

  if (role == 'delete') {
    data = data.filter((item) => item.id != id)

    render()
  }
}

function handleClickEditBtn(event) {
  const { target } = event
  const { role, id } = target.dataset

  if (role == 'edit') {
    if (isEdit == true) {
      alert('finish editing')
      return
    }

    data.forEach((item) => {
      if (item.id == id) {
        editedTodo = item

        const { parentElement } = target
        const editTodo = editTodoTemplate(item)

        parentElement.outerHTML = editTodo

        isEdit = true
      }
    })
  }
}

function handleClickCancelBtn(event) {
  const { role } = event.target.dataset
  if (role == 'cancelEdit') {
    render()

    isEdit = false
  }
}

function handleTodoEditSubm(event) {
  event.preventDefault()

  const { target } = event
  const { role } = target.dataset

  if (role == 'todoEdit') {
    const editedContent = target.querySelector('[name="content"]').value

    editedTodo.todo_content = editedContent

    render()

    isEdit = false
  }
}

//  -----------------------------------------------------------------------------

function createTodoTemplate({ id, todo_content, isChecked }) {
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

function editTodoTemplate({ todo_content }) {
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

function createTodoElements() {
  let result = ''

  data.forEach((todo) => {
    result = result + createTodoTemplate(todo)
  })

  return result
}

function render() {
  const todoElements = createTodoElements()
  listElem.innerHTML = todoElements
}

formElem.addEventListener('submit', handleSubmit)
listElem.addEventListener('submit', handleTodoEditSubm)
listElem.addEventListener('change', handleChange)
listElem.addEventListener('click', handleclickDelBtn)
listElem.addEventListener('click', handleClickEditBtn)
listElem.addEventListener('click', handleClickCancelBtn)
window.addEventListener('beforeunload', handleBeforeUnload)
window.addEventListener('DOMContentLoaded', handleAfterReload)
