import React, { Component } from 'react';
import logo from './logo.svg';
import check from './check.svg';
import remove from './remove.svg';
import uncheck from './uncheck.svg';
import './App.css';

class AppHeader extends Component {
  render() {
    return (
      <header className="col-lg-5 col-centered">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">React todo task's list:</h1>
      </header>
    )
  }
}

class SearchBox extends Component {
  
  render() {
    return (
      <div>
        <label htmlFor="filter">Filter:</label>
        <input className="form-control" name="filter" onInput={this.props.filterItems} />
      </div>
    )
  }
}

function CheckButton(props) {
  if (props.checked) {
    return <button onClick={props.checkHandler} className="btn btn-sm m-1"><img src={uncheck} className="default-icon" alt="Uncheck icon" data-toggle="tooltip" data-placement="top" title="Check as not done"/></button>
  } else {
    return <button onClick={props.checkHandler} className="btn btn-success btn-sm m-1"><img src={check} className="default-icon" alt="Check icon" data-toggle="tooltip" data-placement="top" title="Check as to do"/></button>
  } 
}

class FlashMessage extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    let {flashMessage, flashClass} = this.props;
    return (
      <div id="alert" className={flashClass} role="alert">
        {flashMessage}
      </div>
    )
  }
}

class TodoItemList extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      lastAction: '',
      filtered: [],
      filter: ''
    };
    this.fetchTodos = this.fetchTodos.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.checkTodo = this.checkTodo.bind(this);
  }

  filterItems = (event) => {
    const text = event.currentTarget.value;
    this.getFilteredItems(text);
  }

  getFilteredItems = (text) => {
    this.setState({
      filtered: this.state.todos.filter(item => item.title.toLowerCase().includes(text.toLowerCase())),
      filter: text
    })
  }
  
  setFlashAlert = () => {
    if (this.state.lastAction === 'delete') {
      this.setState({
        flashClass: 'alert alert-danger',
        flashMessage: 'Item was successfully deleted.'
      });
    } else if (this.state.lastAction === 'check') {
      this.setState({
        flashClass: 'alert alert-success',
        flashMessage: 'Item was checked as done.'
      });
    } else if (this.state.lastAction === 'uncheck') {
      this.setState({
        flashClass: 'alert alert-warning',
        flashMessage: 'Item was unchecked.'
      });
    } else {
      this.setState({
        flashClass: 'hide',
        flashMessage: ''
      });
    }
  }

  displayFlashAlert = (action) => {
    this.setState({
      lastAction: action
    });
    this.setFlashAlert();
    setTimeout(() => {
      this.setState({
        lastAction: ''
      });
      this.setFlashAlert();
    }, 3000);
  }

  async fetchTodos() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/');
      const todos = await res.json();
      this.setState({
        todos,
      }, () => {
        this.getFilteredItems(this.state.filter)
      });
    } catch (e) {
      console.log(e);
    }
  }

  toggleEdit = (id) => {
    this.setState({
      editing: id
    });
  }

  async deleteTodo(id) {
    try {
      await fetch('http://127.0.0.1:8000/api/' + id, {
        method: 'DELETE',
      }).then(() => {
        this.fetchTodos();
        this.displayFlashAlert('delete');
      });
    } catch (e) {
      console.log(e);
    }
  }

  async checkTodo(id, checked) {
    try {
      await fetch('http://127.0.0.1:8000/api/' + id, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          checked: checked ? false : true,
        })
      }).then(() => {
        this.fetchTodos();
        this.displayFlashAlert(checked ? 'uncheck' : 'check');
      });
    } catch (e) {
      console.log(e);
    }
  }

  async componentDidMount() {
    await this.fetchTodos();
  }

  render() {
    let todos = this.state.filter ? this.state.filtered : this.state.todos ;
    if (todos.length > 0) {
      return (
        <div className="col-lg-5 col-centered">
        <SearchBox filterItems={this.filterItems}/>
        <TodoForm fetchTodos={this.fetchTodos} />
        <FlashMessage flashMessage={this.state.flashMessage} flashClass={this.state.flashClass} />
          {
            todos.map(item => (
              <div className="mb-3">
                <TodoItem id={item.id} title={item.title} editing={this.state.editing} fetchTodos={this.fetchTodos} toggleEdit={this.toggleEdit} deleteTodo={this.deleteTodo} checked={item.checked} checkTodo={this.checkTodo}/>
              </div>
            ))
          }
        </div>
      )
    } else {
      return (
        <div className="col-lg-5 col-centered">
        <SearchBox filterItems={this.filterItems}/>
        <TodoForm fetchTodos={this.fetchTodos} />  
        <p>Nothing found.</p>
        </div>
      )
    }
  }
}

class TodoForm extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  state = {
    titleValue: ''
  }
  handleTitleChange = (event) => {
    this.setState({
      titleValue: event.target.value
    });
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    await fetch('http://127.0.0.1:8000/api/', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        title: this.state.titleValue,
      })
    }).then(() => {
      this.props.fetchTodos();
    });
  }
  render() {
    let {titleValue} = this.state;
    return (
      <div className="mt-3 mb-3">
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Add task:</label>
            <input className="form-control" onChange={this.handleTitleChange} type="text" name="title" value={titleValue} placeholder="Title"/>
          </div>  
          <input className="btn btn-primary btn-block" type="submit" value="Submit" />
        </form>
      </div>
      )
    }
}

class TodoItem extends TodoForm {
  constructor(props) {
    super(props);
    this.state = {
      titleValue: this.props.title
    };
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      titleValue: nextProps.title
    });
  }

  editHandler = () => {
    this.props.toggleEdit(this.props.id);
  }
  deleteHandler = () => {
    this.props.deleteTodo(this.props.id);
  }
  checkHandler = () => {
    this.props.checkTodo(this.props.id, this.props.checked);
  }
  
  async handleSubmit(event, id) {
    event.preventDefault();
    await fetch('http://127.0.0.1:8000/api/' + this.props.id, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        title: this.state.titleValue
      })
    }).then(() => {
      this.props.toggleEdit(null);
      this.props.fetchTodos();
    });
  }

  render() {
    let {id, title, editing} = this.props;
    if (id === editing) {
      return (
        <div key={id}>
          <form className="form-group" onSubmit={this.handleSubmit}>
          <div className="form-row align-items-center">
            <input className="form-control" onChange={this.handleTitleChange} type="text" name="title" value={this.state.titleValue} onBlur={this.handleSubmit} placeholder="Title"/>
            </div>
          </form>
        </div>
      )
    } else {
      return (
        <div className="row" key={id}>
          <div className="col-md-9" onClick={this.editHandler} data-toggle="tooltip" data-placement="top" title="Click to edit">
            <span className={(this.props.checked) ? 'task-completed' : ''}>{this.state.titleValue}</span>
          </div>
          <div className="col-md-3 text-right">  
            <CheckButton checkHandler={this.checkHandler} checked={this.props.checked}/>
            <button onClick={this.deleteHandler} className="btn btn-danger btn-sm"><img src={remove} className="default-icon" alt="Remove icon" data-toggle="tooltip" data-placement="top" title="Delete" /></button>
          </div>
        </div>
        )
      }
  }
}


class App extends Component {
  
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div className="App" className="container">
      <AppHeader />
      <TodoItemList /><br />
      </div>
    );
  }
}

export default App;
