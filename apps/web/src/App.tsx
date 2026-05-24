import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

import { AppChrome } from './components/AppChrome'

import { SecondaryPanelLayout } from './components/SecondaryPanelLayout'

import { ProtectedLayout, PublicOnly } from './components/RouteGuards'

import { LoginRoute } from './routes/LoginRoute'

import { RegisterRoute } from './routes/RegisterRoute'

import { ToolsOnboardingRoute } from './routes/ToolsOnboardingRoute'

import { MarketplaceRoute } from './routes/MarketplaceRoute'

import { ConnectionsRoute } from './routes/ConnectionsRoute'

import { ProfileRoute } from './routes/ProfileRoute'

import { CreateWorkspacePage } from './pages/CreateWorkspacePage'

import { CreateOrganizationPage } from './pages/CreateOrganizationPage'

import { CreateGroupPage } from './pages/CreateGroupPage'

import { AcceptInvitePage } from './pages/AcceptInvitePage'

import { ToolsOnboardingPanel } from './components/ToolsOnboardingPanel'

import { authStorage } from './platform/storage'

import { bffApi } from './platform/bff'

import './i18n'

import './styles/app.css'



export default function App() {

  return (

    <AuthProvider storage={authStorage} api={bffApi}>

      <BrowserRouter>

        <Routes>

          <Route

            path="/login"

            element={

              <PublicOnly>

                <LoginRoute />

              </PublicOnly>

            }

          />

          <Route

            path="/register"

            element={

              <PublicOnly>

                <RegisterRoute />

              </PublicOnly>

            }

          />

          <Route path="/accept-invite" element={<AcceptInvitePage />} />

          <Route element={<ProtectedLayout />}>

            <Route element={<AppChrome />}>

              <Route index element={<Navigate to="/chat" replace />} />

              <Route path="chat" element={null} />

              <Route

                path="onboarding/tools"

                element={

                  <ToolsOnboardingPanel>

                    <ToolsOnboardingRoute />

                  </ToolsOnboardingPanel>

                }

              />

              <Route element={<SecondaryPanelLayout />}>

                <Route path="mcp" element={<MarketplaceRoute />} />

                <Route path="connections" element={<ConnectionsRoute />} />

                <Route path="profile" element={<ProfileRoute />} />

                <Route path="workspaces/new" element={<CreateWorkspacePage />} />

                <Route path="organizations/new" element={<CreateOrganizationPage />} />

                <Route path="groups/new" element={<CreateGroupPage />} />

              </Route>

            </Route>

          </Route>

          <Route path="*" element={<Navigate to="/chat" replace />} />

        </Routes>

      </BrowserRouter>

    </AuthProvider>

  )

}

