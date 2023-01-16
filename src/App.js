import React from 'react';
import axios from "axios";
import "./App.css";
import { useEffect, useState } from "react";
import { Button, Form, Table, Input } from "antd";
const api = axios.create({
  baseURL: 'http://localhost:4000'
})

const LOCAL_STORAGE_KEY = "books"

function App() { 

  const [books, setBooks] = useState([])
  const [editRow, setEditRow] = useState(null)
  const [form] = Form.useForm()
  const [newTitle, setNewTitle] = useState([])
  const [newAuthor, setNewAuthor] = useState([])
  useEffect(()=> {
    api.get('/books')
    .then(res => setBooks(res.data))
  }, [])

  useEffect(() => {
    let storedBooks;
    if(localStorage.getItem(LOCAL_STORAGE_KEY)) {
      storedBooks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
    }
    if (storedBooks) {
      setBooks(storedBooks)
    }
  }, [])

  const columns = [
    {
      title:"Title",
      key:"title",
      render: (_, content) => {
        if(editRow === content.id) {
          return (
            <Form.Item
              name="title"
              rules={[
                {
                  required:true,
                  message: "Please enter the title"
                }
                ]}>
                  <Input />
            </Form.Item>
          )
        } else {
          return (
            <>
              <h3>{content.title}</h3>
            </>
          )
        }
      }
    },
    {
      title:"Author",
      key:"author",
      render: (_, content) => {
        if(editRow === content.id) {
          return (
            <Form.Item
              name="author"
              rules={[
                {
                  required:true,
                  message: "Please enter the name of author"
                }
                ]}>
                  <Input />
            </Form.Item>
          )
        } else {
          return (
            <>
              <h3>{content.author}</h3>
            </>
          )
        }
      }
    },
    {
      title:"Actions",
      render: (_, content) => {
        return (
          <>
            <Button onClick={()=> {
              setEditRow(content.id);
              form.setFieldsValue({
                title: content.title,
                author: content.author
              })
            }}
            >Edit</Button>
            <Button htmlType='submit'>Save</Button>
            <Button onClick={() => {
                api.delete(`/books/${content.id}`)
                const updatedDataSource = books.filter(item => item.id !== content.id)
                setBooks(updatedDataSource)
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...updatedDataSource]))
            }}>Delete</Button>
          </>
        )
      }
    }
  ]
  const onFinish = (values) => {
    const updatedDataSource = books.map(e => {
      if(e.id === editRow) {
        api.put(`/books/${e.id}`, {id: e.id, ...values})
        return {id: e.id, ...values}
    }
    return e
  })
    setBooks(updatedDataSource)
    setEditRow(null)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...updatedDataSource]))
  }

  const onPost = () => {
    if(newTitle.length > 0 && newAuthor.length > 0) {
      api.post("/books", {title: newTitle, author: newAuthor})
      api.get("/books")
      .then(res => {
        setBooks(res.data)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data))
      })
    }  else {
      alert("Not enough information!")
    }
  }
  const handleTitleChange = (input) => {
    setNewTitle(input.target.value)
  }
  const handleAuthorChange =  (input) => {
    setNewAuthor(input.target.value);
  }
  
  
  return (
    <div className="App">
      <Form form={form} onFinish={onFinish}>
          <Table columns={columns} dataSource={books}></Table>
      </Form>
      <h2 className='postTitle'>Post your own book!</h2>
      <Form className='postForm'>
          <Input id="inputTitle"className='postInput' onChange={handleTitleChange} placeholder="Please enter title"/>
          <Input id="inputAuthor" className='postInput' onChange={handleAuthorChange} placeholder="Please enter the name of author"/>
          <Button onClick={onPost} htmlType='submit'>POST</Button>
      </Form>
    </div>
  );
}

export default App;