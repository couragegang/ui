import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/AppShell'
import { ProtectedLayout, PublicOnly } from './components/RouteGuards'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChatPage } from './pages/ChatPage'
import { HitlPage } from './pages/HitlPage'
import { McpMarketplacePage } from './pages/McpMarketplacePage'
import { McpConnectionsPage } from './pages/McpConnectionsPage'
import { KnowledgePage } from './pages/KnowledgePage'
import { ProfilePage } from './pages/ProfilePage'
import './i18n'
import './styles/app.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnly>
                <RegisterPage />
              </PublicOnly>
            }
          />
          <Route element={<ProtectedLayout />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="hitl" element={<HitlPage />} />
              <Route path="mcp" element={<McpMarketplacePage />} />
              <Route path="connections" element={<McpConnectionsPage />} />
              <Route path="knowledge" element={<KnowledgePage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
