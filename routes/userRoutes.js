// Public routes (no auth required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (auth required)
router.use(isAuthenticated);  // Apply auth middleware only to routes below this
router.get("/me", getUser);
router.put("/update", updateProfile);
// ... other protected routes 