"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { useAuth } from "../../hooks/useAuth"
import type { RegisterData } from "../../types/auth.types"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const registerSchema: yup.ObjectSchema<RegisterFormData> = yup.object({
  email: yup.string().required("Email is required").email("Please enter a valid email address"),
  firstName: yup
      .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: yup
      .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  password: yup
      .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
      .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
  confirmPassword: yup
      .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  acceptTerms: yup.boolean().required().oneOf([true], "You must accept the terms and conditions"),
})

interface RegisterFormData {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearAuthError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  })

  const watchedFields = watch()
  const password = watch("password")

  // Password strength indicators
  const passwordChecks = {
    length: password?.length >= 8,
    lowercase: /[a-z]/.test(password || ""),
    uppercase: /[A-Z]/.test(password || ""),
    number: /\d/.test(password || ""),
  }

  useEffect(() => {
    if (error) {
      clearAuthError()
    }
  }, [watchedFields.email, watchedFields.firstName, watchedFields.lastName, clearAuthError, error])

  const onSubmit = async (data: RegisterFormData) => {
    if (isLoading) return

    clearAuthError()

    const registerData: RegisterData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
    }

    const success = await registerUser(registerData)
    if (success) {
      setRegistrationSuccess(true)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Created!</h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            We've sent a verification email to <strong>{watchedFields.email}</strong>. Please check your inbox and click
            the verification link to activate your account.
          </p>

          <div className="mb-8">
            <img src="/email-verification-success.png" alt="Email verification" className="mx-auto rounded-lg shadow-sm" />
          </div>

          <div className="space-y-4">
            <Link
              to="/activate"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl inline-block"
            >
              Activate Account
            </Link>

            <Link
              to="/login"
              className="w-full border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 inline-block"
            >
              Back to Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800"></div>
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Animated background elements */}
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-purple-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <div className="mb-12">
              <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                <span className="text-3xl font-bold">TP</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Join thousands of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200">
                  productive teams
                </span>
              </h1>

              <p className="text-xl text-purple-100 mb-12 leading-relaxed">
                Start managing your projects more efficiently with TaskPro's powerful collaboration tools.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full"></div>
                  <span className="text-purple-100 text-lg">Create unlimited projects</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full"></div>
                  <span className="text-purple-100 text-lg">Invite team members instantly</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full"></div>
                  <span className="text-purple-100 text-lg">Track progress in real-time</span>
                </div>
              </div>

              {/* Hero illustration */}
              <div className="relative">
                <img
                  src="/register-image.png"
                  alt="TaskPro Dashboard Preview"
                  className="rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-purple-200 text-sm">Active Teams</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-purple-200 text-sm">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-purple-200 text-sm">Uptime</div>
              </div>
            </div>
              </div>
            </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg">
            {/* Mobile logo and hero image */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">TP</span>
              </div>
              <img
                src="/team-productivity-mobile.png"
                alt="Team productivity"
                className="mx-auto rounded-xl shadow-lg mb-6"
              />
            </div>

            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Create your account</h2>
              <p className="text-gray-600 text-lg">
                Already have an account?{" "}
              <Link
                  to="/login"
                  className="font-semibold text-purple-600 hover:text-purple-500 transition-colors duration-200"
              >
                  Sign in here
              </Link>
            </p>
          </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                    First Name
                  </label>
                  <input
                    {...register("firstName")}
                      type="text"
                      id="firstName"
                    autoComplete="given-name"
                    className={`w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.firstName
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                    Last Name
                  </label>
                  <input
                    {...register("lastName")}
                      type="text"
                      id="lastName"
                    autoComplete="family-name"
                    className={`w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.lastName
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  {...register("email")}
                    type="email"
                    id="email"
                  autoComplete="email"
                  className={`w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:ring-red-500"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  placeholder="john.doe@example.com"
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
                    autoComplete="new-password"
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    placeholder="Create a strong password"
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

                {/* Password strength indicators */}
                {password && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Password requirements:</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {passwordChecks.length ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={`text-xs ${passwordChecks.length ? "text-green-700" : "text-gray-500"}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordChecks.lowercase ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={`text-xs ${passwordChecks.lowercase ? "text-green-700" : "text-gray-500"}`}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordChecks.uppercase ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={`text-xs ${passwordChecks.uppercase ? "text-green-700" : "text-gray-500"}`}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordChecks.number ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={`text-xs ${passwordChecks.number ? "text-green-700" : "text-gray-500"}`}>
                          One number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                    autoComplete="new-password"
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                      type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms acceptance */}
              <div className="flex items-start space-x-3">
                <input
                  {...register("acceptTerms")}
                    id="acceptTerms"
                    type="checkbox"
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-600 font-medium">{errors.acceptTerms.message}</p>}

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
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" text="" />
                    <span className="ml-3">Creating your account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our terms and privacy policy.
              </p>

              {/* Trust indicators */}
              <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>SOC 2 Certified</span>
                </div>
              </div>
            </div>
            </div>
            </div>
        </div>
      </div>
  )
}

export default RegisterPage
