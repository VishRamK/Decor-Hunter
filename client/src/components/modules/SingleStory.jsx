import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { post, get } from "../../utilities";

/**
 * Story is a component that renders creator and content of a story
 *
 * Proptypes
 * @param {string} _id of the story
 * @param {string} creator_name
 * @param {string} content of the story
 * @param {string} img_url optional url of the story image
 */
const SingleStory = (props) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    get("/api/saved-story", { storyId: props._id }).then((data) => {
      setIsSaved(data.isSaved);
    });
  }, [props._id]);

  const handleSave = () => {
    const endpoint = isSaved ? "/api/unsave-story" : "/api/save-story";
    post(endpoint, { storyId: props._id }).then(() => {
      setIsSaved(!isSaved);
    });
  };

  return (
    <div className="Card-story">
      <Link to={`/profile/${props.creator_id}`} className="u-link u-bold">
        {props.creator_name}
      </Link>
      <p className="Card-storyContent">{props.content}</p>
      {props.img_url && <img src={props.img_url} alt="Story" className="Card-storyImage" />}
      <button onClick={handleSave} className="Card-saveButton">
        {isSaved ? "Unsave" : "Save"}
      </button>
    </div>
  );
};

export default SingleStory;
