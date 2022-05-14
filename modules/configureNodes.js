/* Node에 대한 정보가 담긴 객체를 받아 Node를 만들어 반환하는 함수 */
// nodeInfo = {tag: "div", className: "클래스명", id: "id", ...}
function createNode(nodeInfo) {
  const domTag = nodeInfo.match(/(?<=\<)\w{1,}/g);        // HTML 태그명 추출
  const attr = nodeInfo.match(/\w{1,10}(?=\=)/g);         // 속성명 추출
  const attrValue = nodeInfo.match(/(?<=\=").*?(?=")/g);  // 속성값 추출
  let node;

  if (!domTag) {  // A. textNode 생성(Tab 제외)
    const textNode = nodeInfo.match(/(?<=\t)[^\t](.*)/g) || "";
    return document.createTextNode(textNode);
  }

  node = document.createElement(domTag);  // B-1. 일반 element 생성
  for (let i = 0; i < attr.length; i++) {  // B-2. 일반 element 속성 지정
    node.setAttribute(attr[i], attrValue[i]);
  }
  return node;
}

/* Node 배열과 계층 구조를 담은 배열을 이용해 모든 Node를 삽입하는 함수 */
function appendAllNodes(nodeArray, depth) {
  for (let i = 1; i < depth.length; i++) {
    const currentNodeDepth = depth[i];
    const reversed = depth.slice(0, i).reverse()
    const parentIndex = i - reversed.findIndex((element) => { return element === currentNodeDepth - 1 }) - 1;

    nodeArray[parentIndex].appendChild(nodeArray[i]);
  }
  return nodeArray[0];  // 모든 자식 요소가 삽입된 최상위 Node 반환
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
    `<div class="task" id="${taskObj.id}">`,
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

  const depth = hierarchyDetector(taskNodeInfo);

  for (let i = 0; i < taskNodeInfo.length; i++) {
    const node = createNode(taskNodeInfo[i]);
    returnNode.push(node);
  }

  const confResult = appendAllNodes(returnNode, depth);
  document.body.appendChild(confResult);

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
  let filteredTagArray;
  const { makeCheckbox, fetchDB } = { makeCheckbox: false, fetchDB: true, ...userOptions };

  // 중복된 태그 생성을 막기 위해 indexedDB에 존재하는 태그를 제외한 배열을 만듦
  if (targetNode.className === 'tag-list' && fetchDB) {
    filteredTagArray = await filterTags(tagArray);
  }


  // ["태그1", "태그2", ...]
  filteredTagArray.forEach((_tag) => { // TODO: 태그 리스트에 추가하는 경우, 각 Task에 태그를 추가하는 경우 함수 나누기
    const tagNodeInfo = [
      `<label class="tags">`,
      ` ${_tag}`
    ];

    if (makeCheckbox) { // 태그별 Task 필터링을 위한 체크박스 생성
      tagNodeInfo.push(` <input type="checkbox">`);
    }

    createNode(tagNodeInfo);
    const depth = hierarchyDetector(tagNodeInfo);


    /* targetNode.appendChild(newTag); */
  });
}







/* Task Element(div.task)를 완료 여부에 따라 이동시키는 함수 */
function moveTaskNode(taskNode, destClassName) {
  const destElement = document.querySelector(`section.${destClassName}`);

  destElement.appendChild(taskNode);

  if (destClassName === 'ongoing') { // 미완료된 할일일 경우
    taskNode.querySelector('input').removeAttribute('checked');
  } else if (destClassName === 'completed') { // 완료된 할일일 경우
    taskNode.querySelector('input').setAttribute('checked', '1');
  }
}




export { configureTaskNode, configureTagNode, moveTaskNode };