// pages/_app.js
import '../styles/globals.css'
import { Provider } from 'react-redux'
import store from '../src/store/store'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import ErrorBoundary from '../src/components/common/ErrorBoundary'

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  )
}