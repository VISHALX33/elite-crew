import fs from 'fs';

const filePath = './controllers/userController.js';
let content = fs.readFileSync(filePath, 'utf8');

// The register function block
const registerStart = content.indexOf('export const register = async (req, res) => {');
const registerEnd = content.indexOf('// Login', registerStart);

if (registerStart !== -1 && registerEnd !== -1) {
  const newRegister = `export const register = async (req, res) => {
  try {
    const { name, email, password, role: requestedRole, companyName, businessAddress, phone } = req.body;
    let userExists = await User.findOne({ email });

    if (userExists && userExists.isEmailVerified) {
      return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    if (userExists) {
      if (password) userExists.password = await bcrypt.hash(password, 10);
      userExists.otp = otp;
      userExists.otpExpires = otpExpires;
      userExists.name = name;
      userExists.phone = phone || userExists.phone;
      if (requestedRole === 'vendor') {
        userExists.companyName = companyName;
        userExists.businessAddress = businessAddress;
      }
      await userExists.save();
    } else {
      let lastUser = await User.findOne({ user_uni_id: { $exists: true } }).sort({ createdAt: -1 });
      let nextNumber = 1;
      if (lastUser && lastUser.user_uni_id) {
        const lastNum = parseInt(lastUser.user_uni_id.replace('USR', ''));
        if (!isNaN(lastNum)) nextNumber = lastNum + 1;
      }
      const user_uni_id = \`USR\${String(nextNumber).padStart(4, '0')}\`;
      const hashedPassword = await bcrypt.hash(password, 10);
      let role = requestedRole || 'user';
      if (email === 'admin@gmail.com' || email === 'vishal@gmail.com') role = 'admin';

      await User.create({
        name, email, password: hashedPassword, wallet: 0, user_uni_id, role,
        phone: phone || undefined,
        companyName: role === 'vendor' ? companyName : '',
        businessAddress: role === 'vendor' ? businessAddress : '',
        isApproved: role === 'admin',
        isEmailVerified: false, otp, otpExpires
      });
    }

    try {
      await resend.emails.send({
        from: 'Elite Crew <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your Elite Crew Account',
        html: \`<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Elite Crew!</h2>
          <p>Please enter the following OTP to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">
            \${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>\`
      });
    } catch(err) {
      console.log('Resend email error:', err);
    }

    res.status(201).json({ message: 'OTP sent to your email. Please verify.', email, requiresVerification: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Email OTP
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(user.otpExpires)) return res.status(400).json({ message: 'OTP has expired' });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Email verified successfully', token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await resend.emails.send({
        from: 'Elite Crew <onboarding@resend.dev>',
        to: email,
        subject: 'Your new Elite Crew OTP',
        html: \`<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Elite Crew Verification</h2>
          <p>Your new OTP is:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">
            \${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>\`
      });
    } catch(err) {
      console.log('Resend error:', err);
    }

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

`;
  
  content = content.slice(0, registerStart) + newRegister + content.slice(registerEnd);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated userController.js');
} else {
  console.log('Could not find register block');
}
