import { useState } from 'react'
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { EasyOcrPage } from './pages/EasyOcrPage';

function App() {
	const [count, setCount] = useState(0)

	return (
		<BrowserRouter>
		<Routes>
			<Route path="/" element={<EasyOcrPage />} />
		</Routes>
		</BrowserRouter>
	)
}

export default App
