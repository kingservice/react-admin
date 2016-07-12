import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

const CreateButton = ({ basePath }) => <FlatButton label="Create" icon={<ContentAdd />} containerElement={<Link to={`${basePath}/create`} />} />;

CreateButton.propTypes = {
    basePath: PropTypes.string.isRequired,
};

export default CreateButton;
