import React, { useState, useEffect, useContext } from "react";
import Card from "../modules/Card";
import { NewStory } from "../modules/NewPostInput";
import { UserContext } from "../App";
import { Link, useParams } from "react-router-dom";

import { get } from "../../utilities";

const Feed = () => {
  const [stories, setStories] = useState([]);
  const userId = useContext(UserContext);

  // called when the "Feed" component "mounts", i.e.
  // when it shows up on screen
  useEffect(() => {
    document.title = "News Feed";
    get("/api/stories").then((storyObjs) => {
      let reversedStoryObjs = storyObjs.reverse();
      setStories(reversedStoryObjs);
    });
  }, []);

  // this gets called when the user pushes "Submit", so their
  // post gets added to the screen right away
  const addNewStory = (storyObj) => {
    setStories([storyObj].concat(stories));
  };

  let storiesList = null;
  const hasStories = stories.length !== 0;
  if (hasStories) {
    storiesList = stories.map((storyObj) => (
      <Card
        key={`Card_${storyObj._id}`}
        _id={storyObj._id}
        creator_name={storyObj.creator_name}
        creator_id={storyObj.creator_id}
        content={storyObj.content}
        img_url={storyObj.img_url}
        isGenerated={storyObj.isGenerated}
      />
    ));
  } else {
    storiesList = <div>No stories!</div>;
  }
  return (
    <>
      <center>
        <Link to={"/"}>Home</Link>
      </center>
      <hr />
      {userId && <NewStory addNewStory={addNewStory} />}
      {storiesList}
    </>
  );
};

export default Feed;
