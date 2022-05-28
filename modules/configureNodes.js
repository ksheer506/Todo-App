import { isTagExistInDB } from "./db/fetching.js"

/* Node에 대한 정보가 담긴 객체를 받아 Node를 만들어 반환하는 함수 */
function createNode(nodeInfo) {
  const domTag = nodeInfo.match(/(?<=\<)\w{1,}/g);        // HTML 태그명 추출
  const attr = nodeInfo.match(/\w{1,10}(?=\=)/g);         // 속성명 추출
  const attrValue = nodeInfo.match(/(?<=\=").*?(?=")/g);  // 속성값 추출

  if (!domTag) {  // A. textNode 생성(문자열 앞 모든 Tab 제외)
    const textNode = nodeInfo.match(/(?<=\t)[^\t](.*)/g) || "";
    return document.createTextNode(textNode);
  }

  let node = document.createElement(domTag);  // B-1. 일반 element 생성
  for (let i = 0, n = attr.length; i < n; i++) {  // B-2. 일반 element 속성 지정
    node.setAttribute(attr[i], attrValue[i]);
  }

  return node;
}

/* Node 배열과 계층 구조를 담은 배열을 이용해 모든 Node를 삽입하는 함수 */
function appendAllNodes(nodeArray, depth, ...targetParent) {
  for (let i = 1, n = depth.length; i < n; i++) {
    const reversed = depth.slice(0, i).reverse()
    const parentIndex = i - 1 - reversed.findIndex((currentDepth) => { return currentDepth === depth[i] - 1 });

    if (parentIndex === i) continue;  // 자신이 최상위 Node일 경우 다음 Node로 
    nodeArray[parentIndex].appendChild(nodeArray[i]);
  }

  const topLevelNode = nodeArray.filter((node, i) => (depth[i] === 0));
  if (targetParent[0]) {
    topLevelNode.forEach(node => targetParent[0].appendChild(node));
  }

  return topLevelNode;  // 모든 자식 요소가 삽입된 최상위 Node 배열 반환
}

/* DOM Node의 계층 구조(Tab의 개수)를 반환하는 함수 */
// return: [0, 1, 2, 2, ...] 숫자가 작을수록 상위 요소, 차이가 1이면 부모-자식 관계
function hierarchyDetector(taskNodeInfo) {
  return taskNodeInfo.map(nodeString => {
    return nodeString.match(/\t/g)?.length || 0
  });
}

/* Task Node를 생성하는 함수 */
function configureTaskNode(taskObj) {
  const returnNode = [];
  const taskDueDate = taskObj.dueDate || '';
  const taskNodeInfo = [
    `<li class="task" id="${taskObj.id}">`,
    `	<div class="task-label">`,
    `		<input type="checkbox">`,
    `		${taskObj.title}`,
    `	<div class="task-tags">`,
    `	<div class="extra">`,
    `		<label class="dueDate" for="datepicker ${taskObj.id}">`,
    `			${taskDueDate}`,
    `			<input type="date" id="datepicker ${taskObj.id}">`,
    `		<div class="close" tabindex="0">`,
    `			x`
  ];

  for (let i = 0; i < taskNodeInfo.length; i++) {
    const node = createNode(taskNodeInfo[i]);
    returnNode.push(node);
  }
  const depth = hierarchyDetector(taskNodeInfo);
  const [confResult] = appendAllNodes(returnNode, depth);
  
  return confResult;
}

/* Tag 배열에서 DB에 이미 존재하는 태그를 필터링하는 함수 */
async function filterTags(tagArray) {
  const searchResult = await isTagExistInDB(tagArray);

  return tagArray.reduce((accu, nextObj, index) => {
    if (!searchResult[index]) { accu.push(nextObj.tag); }
    return accu;
  }, []);
}

async function configureTagNode(targetNode, tagArray, userOptions = {}) {
  const { makeCheckbox, fetchDB } = { makeCheckbox: false, fetchDB: true, ...userOptions };
  let checkbox = makeCheckbox ? '<input type="checkbox">' : '';

  // 중복된 태그 생성을 막기 위해 indexedDB에 존재하는 태그를 제외한 배열을 만듦
  if (targetNode.className === 'tag-list' && fetchDB) {
    tagArray = await filterTags(tagArray);
  }

  // ["태그1", "태그2", ...]
  const tagNodeInfo = tagArray
    .flatMap(tagName => [`<label class="tags">`, `	${tagName}`, `	${checkbox}`]);
  const tagNodes = tagNodeInfo.map(node => createNode(node));
  const depth = hierarchyDetector(tagNodeInfo);

  appendAllNodes(tagNodes, depth, targetNode);
}

/* Task Element(div.task)를 완료 여부에 따라 이동시키는 함수 */
function moveTaskNode(taskNode, destClassName) {
  const destElement = document.querySelector(`ul.${destClassName}`);
  destElement.appendChild(taskNode);

  if (destClassName === 'ongoing') { // 미완료된 할일일 경우
    taskNode.querySelector('input').removeAttribute('checked');
    return;
  }
  if (destClassName === 'completed') { // 완료된 할일일 경우
    taskNode.querySelector('input').setAttribute('checked', '1');
    return;
  }
}


export { configureTaskNode, configureTagNode, moveTaskNode };