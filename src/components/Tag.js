import React from 'react';
import "./Tag.css"
const { useState, useEffect, useRef, useCallback } = React;



function Tag(props) {
  const { tagText, makeChk } = props;

  return (
    <label className='tags'>
      {tagText}
      {makeChk && <input type="checkbox" />}
    </label>  // 할일 필터링 용 체크박스
  );
};

export default Tag;