"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { useAuth } from "../../hooks/useAuth"
import type { LoginCredentials } from "../../types/auth.types"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const loginSchema: yup.ObjectSchema<LoginCredentials> = yup.object({
  email: yup.string().required("Email is required").email("Please enter a valid email address"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
})

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearAuthError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const from = location.state?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
  })

  // Watch for changes in form fields to clear errors
  const watchedFields = watch()

  useEffect(() => {
    if (error) {
      clearAuthError()
    }
  }, [watchedFields.email, watchedFields.password, clearAuthError, error])

  const onSubmit = async (data: LoginCredentials) => {
    if (isLoading) return

    clearAuthError()
    const success = await login(data)
    if (success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Animated background elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <div className="mb-12">
              <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                <span className="text-3xl font-bold">TP</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Welcome back to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  TaskPro
                </span>
              </h1>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Continue managing your projects with powerful tools designed for modern teams.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"></div>
                  <span className="text-blue-100 text-lg">Access all your projects instantly</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full"></div>
                  <span className="text-blue-100 text-lg">Collaborate seamlessly with your team</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full"></div>
                  <span className="text-blue-100 text-lg">Track progress in real-time</span>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <img
                src="/login-image.svg"
                alt="Dashboard preview"
                className="rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">TP</span>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Sign in</h2>
              <p className="text-gray-600 text-lg">
                New to TaskPro?{" "}
              <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                  Create your account
              </Link>
            </p>
          </div>

            {/* Success message from registration */}
            {location.state?.message && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-green-800 font-medium">{location.state.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  {...register("email")}
                    type="email"
                    id="username"
                  autoComplete="email"
                  className={`w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.email  
                      ? "border-red-300 bg-red-50 focus:ring-red-500"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                      id="password"
                    autoComplete="current-password"
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                      type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium">
                    Remember me
                  </label>
            </div>

                <Link
                    to="/forgot-password"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            {/* Submit button */}
              <button
                  type="submit"
                  disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" text="" />
                    <span className="ml-3">Signing you in...</span>
                  </div>
                ) : (
                  "Sign in to TaskPro"
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-center text-sm font-semibold text-gray-700 mb-4">Try with demo accounts</p>
              <div className="space-y-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Admin Account</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Full Access</span>
                  </div>
                  <p className="text-gray-600 mt-1">admin@example.com / password123</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">User Account</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Standard</span>
                  </div>
                  <p className="text-gray-600 mt-1">user@example.com / password123</p>
                </div>
              </div>
            </div>

            {/* Footer links */}
            <div className="mt-8 text-center">
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <Link to="/terms" className="hover:text-gray-700 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="hover:text-gray-700 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/help" className="hover:text-gray-700 transition-colors">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
  )
}

export default LoginPage
