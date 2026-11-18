import React from 'react'
import AppRoutes from './app/router'
import {Provider} from 'react-redux'
import { store } from './app/store'
const App = () => {
  return (
    <Provider store={store}>
      <AppRoutes/>
    </Provider>
  )
}

export default App