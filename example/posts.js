import React from 'react';
import {
    BooleanField,
    BooleanInput,
    CheckboxGroupInput,
    Create,
    Datagrid,
    DateField,
    DateInput,
    DisabledInput,
    Edit,
    EditButton,
    Filter,
    Tab,
    ImageField,
    ImageInput,
    List,
    LongTextInput,
    NumberField,
    NumberInput,
    ReferenceManyField,
    Responsive,
    RichTextField,
    SelectField,
    SelectInput,
    Show,
    ShowButton,
    SimpleForm,
    SimpleList,
    SimpleShowLayout,
    TabbedForm,
    TabbedShowLayout,
    TextField,
    TextInput,
    minValue,
    number,
    required,
    translate,
} from 'admin-on-rest';
import RichTextInput from 'aor-rich-text-input';
import Chip from 'material-ui/Chip';

export PostIcon from 'material-ui/svg-icons/action/book';

const QuickFilter = translate(({ label, translate }) => <Chip style={{ marginBottom: 8 }}>{translate(label)}</Chip>);

const PostFilter = ({ ...props }) => (
    <Filter {...props}>
        <TextInput label="post.list.search" source="q" alwaysOn />
        <TextInput source="title" defaultValue="Qui tempore rerum et voluptates" />
        <QuickFilter label="resources.posts.fields.commentable" source="commentable" defaultValue={true} />
    </Filter>
);

const titleFieldStyle = { maxWidth: '20em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
export const PostList = ({ ...props }) => (
    <List {...props} filters={<PostFilter />} sort={{ field: 'published_at', order: 'DESC' }}>
        <Responsive
            small={
                <SimpleList
                    primaryText={record => record.title}
                    secondaryText={record => `${record.views} views`}
                    tertiaryText={record => new Date(record.published_at).toLocaleDateString()}
                />
            }
            medium={
                <Datagrid>
                    <TextField source="id" />
                    <TextField source="title" style={titleFieldStyle} />
                    <DateField source="published_at" style={{ fontStyle: 'italic' }} />
                    <BooleanField source="commentable" />
                    <NumberField source="views" />
                    <EditButton />
                    <ShowButton />
                </Datagrid>
            }
        />
    </List>
);

const PostTitle = translate(({ record, translate }) => {
    return <span>{record ? translate('post.edit.title', { title: record.title }) : ''}</span>;
});

export const PostCreate = ({ ...props }) => (
    <Create {...props}>
        <SimpleForm defaultValue={{ average_note: 0 }} validate={(values) => {
            const errors = {};
            ['title', 'teaser'].forEach((field) => {
                if (!values[field]) {
                    errors[field] = ['Required field'];
                }
            });

            if (values.average_note < 0 || values.average_note > 5) {
                errors.average_note = ['Should be between 0 and 5'];
            }

            return errors;
        }}>
            <TextInput source="title" />
            <TextInput source="password" type="password" />
            <TextInput source="teaser" options={{ multiLine: true }} />
            <RichTextInput source="body" />
            <DateInput source="published_at" defaultValue={() => new Date()} />
            <NumberInput source="average_note" />
            <BooleanInput source="commentable" defaultValue={true} />
        </SimpleForm>
    </Create>
);

export const PostEdit = ({ ...props }) => (
    <Edit title={<PostTitle />} {...props}>
        <TabbedForm defaultValue={{ average_note: 0 }}>
            <Tab label="post.form.summary">
                <DisabledInput source="id" />
                <TextInput source="title" validate={required} />
                <CheckboxGroupInput
                    source="notifications"
                    choices={[
                        { id: 12, name: 'Ray Hakt' },
                        { id: 31, name: 'Ann Gullar' },
                        { id: 42, name: 'Sean Phonee' },
                    ]}
                />
                <LongTextInput source="teaser" validate={required} />
                <ImageInput multiple source="pictures" accept="image/*">
                    <ImageField source="src" title="title" />
                </ImageInput>
            </Tab>
            <Tab label="post.form.body">
                <RichTextInput source="body" label="" validate={required} addLabel={false} />
            </Tab>
            <Tab label="post.form.miscellaneous">
                <TextInput source="password" type="password" />
                <DateInput source="published_at" />
                <SelectInput source="category" choices={[
                    { name: 'Tech', id: 'tech' },
                    { name: 'Lifestyle', id: 'lifestyle' },
                ]} />
                <NumberInput source="average_note" validate={[number, minValue(0)]} />
                <BooleanInput source="commentable" defaultValue />
                <DisabledInput source="views" />
            </Tab>
            <Tab label="post.form.comments">
                <ReferenceManyField reference="comments" target="post_id" addLabel={false}>
                    <Datagrid>
                        <DateField source="created_at" />
                        <TextField source="author.name" />
                        <TextField source="body" />
                        <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </Tab>
        </TabbedForm>
    </Edit>
);

export const PostShow = ({ ...props }) => (
    <Show title={<PostTitle />} {...props}>
        <TabbedShowLayout>
            <Tab label="post.form.summary">
                <TextField source="id" />
                <TextField source="title" validation={{ required: true }} />
                <TextField source="teaser" validation={{ required: true }} />
            </Tab>
            <Tab label="post.form.body">
                <RichTextField source="body" label="" validation={{ required: true }} addLabel={false} />
            </Tab>
            <Tab label="post.form.miscellaneous">
                <DateField source="published_at" />
                <TextField source="average_note" validation={{ min: 0 }} />
                <BooleanField source="commentable" defaultValue />
                <TextField source="views" />
            </Tab>
            <Tab label="post.form.comments">
                <ReferenceManyField reference="comments" target="post_id" addLabel={false}>
                    <Datagrid>
                        <DateField source="created_at" />
                        <TextField source="author.name" />
                        <TextField source="body" />
                        <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </Tab>
        </TabbedShowLayout>
    </Show>
);
