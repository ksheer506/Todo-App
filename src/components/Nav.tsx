import { promises as fs } from "fs";
import React from "react";
import { fetchAllData } from "../modules/db/fetching";

import "./Nav.css"

const Nav = () => {

  const exportAllData = async () => {
    const [task, tag] = await fetchAllData(["task", "tagList"]);
    const formatted = {task,  tag}; 

    /* await fs.writeFile("./test.json", JSON.stringify(formatted)) */
  }

  return (
  <nav>
    <input type="button" id="login" value="로그인" />
    <input type="button" id="login" value="내보내기" onClick={exportAllData} />
    <input type="button" id="login" value="가져오기" />
  </nav>
  )
}

export default Nav;