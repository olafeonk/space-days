import './App.css';

function App() {
  return (
    <div className="App">
      <form className="registration-form">
        <label className="registration-form__label">
          <input className="registration-form__input" type="text" placeholder="Телефон" />
        </label>
        <label className="registration-form__label">
          <input className="registration-form__input" type="text" placeholder="Фамилия" />
        </label>
        <label className="registration-form__label">
          <input className="registration-form__input" type="text" placeholder="Имя" />
        </label>
        <label className="registration-form__label">
          <input className="registration-form__input" type="date" placeholder="Дата рождения" />
        </label>
        <label className="registration-form__label">
          <input className="registration-form__input" type="email" placeholder="email" />
        </label>
        <label className="registration-form__label">
          <input className="registration-form__input" type="submit" value="Отправить" />
        </label>
      </form>
    </div>
  );
}

export default App;
