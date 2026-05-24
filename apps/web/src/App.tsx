import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppShell } from './components/AppShell'
import { ProtectedLayout, PublicOnly } from './components/RouteGuards'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { McpMarketplacePage } from './pages/McpMarketplacePage'
import { McpConnectionsPage } from './pages/McpConnectionsPage'
import { ToolsOnboardingPage } from './pages/ToolsOnboardingPage'
import { ProfilePage } from './pages/ProfilePage'
import { CreateWorkspacePage } from './pages/CreateWorkspacePage'
import { CreateOrganizationPage } from './pages/CreateOrganizationPage'
import { CreateGroupPage } from './pages/CreateGroupPage'
import { AcceptInvitePage } from './pages/AcceptInvitePage'
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
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route element={<ProtectedLayout />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="chat" element={<></>} />
              <Route path="onboarding/tools" element={<ToolsOnboardingPage />} />
              <Route path="mcp" element={<McpMarketplacePage />} />
              <Route path="connections" element={<McpConnectionsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="workspaces/new" element={<CreateWorkspacePage />} />
              <Route path="organizations/new" element={<CreateOrganizationPage />} />
              <Route path="groups/new" element={<CreateGroupPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
