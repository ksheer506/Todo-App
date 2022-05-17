const mainTitle = document.querySelector('header > h2');
const editTitle = document.querySelector('#edit-title');
const darkToggler = document.querySelector('#default');

/* 사이드 패널 */
const sdPanel = document.querySelector('aside');
const sdTitle = document.querySelector('aside h2');
const sdDueDate = document.querySelector('aside .dueDate');
const sdTags = document.querySelector('aside .tag-list');
const sdText = document.querySelector("aside .text");

/* Task 추가 */
const newTask = document.querySelector('#add-task input[type=text]');
const datePicker = document.querySelector('#add-task input[type=date]');
const addBtn = document.querySelector('#add-task input[type=button]');

/* Task 목록 */
const taskList = document.querySelector('.todo_list');
const allTasks = document.getElementsByClassName('task');  // HTML Collection

/* 태그 목록 */
const newTag = document.querySelector('#createTag');
const addTagBtn = document.querySelector('.tag-conf #addTag');
const deleteTagBtn = document.querySelector('.tag-conf #deleteTag');

/* 태그 목록 */
const tagList = document.querySelector('.tag-list');

export {
  mainTitle, editTitle, darkToggler, 
  sdPanel, sdTitle, sdDueDate, sdTags, sdText,
  newTask, datePicker, addBtn, taskList, allTasks,
  newTag, addTagBtn, deleteTagBtn, tagList,
}