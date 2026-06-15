package com.banking.core.lite.auth.service;

import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.auth.entity.VerificationStatus;
import com.banking.core.lite.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;
import com.banking.core.lite.common.exception.UserNotFoundException;
import com.banking.core.lite.common.exception.ValidationException;

@Service
@RequiredArgsConstructor
public class OTPService {
    private final PasswordEncoder encoder;
    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private static final String OTP_PREFIX = "OTP_";



    public boolean sendEmailOtp(String email) {
        // Check if user exists before sending OTP
        if (!userRepository.existsByEmail(email)) {
            throw new UserNotFoundException(email);
        }

        // Generate 4-digit OTP
        String otp = String.format("%04d", new Random().nextInt(10000));

        // Save to Redis (Key: OTP_user@email.com, Value: 1234, Timeout: 15 mins)
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, Duration.ofMinutes(15));

        // Send Email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your OTP Code");
            message.setText("Your 4-digit verification code is: " + otp);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    public void changePass(String email,String opt,String newPass){
        User existEmail=userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException(email));
        String storeOpt=redisTemplate.opsForValue().get(OTP_PREFIX+email);
        if(storeOpt==null || !storeOpt.equals(opt)){
            throw new ValidationException("OTP has expired or is invalid");
        }
        existEmail.setPassword(encoder.encode(newPass));
        userRepository.save(existEmail);
        redisTemplate.delete(OTP_PREFIX+email);
    }
    public void verify(String email,String opt){
        User existEmail=userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException(email));
        String storeOpt=redisTemplate.opsForValue().get(OTP_PREFIX+email);
        if(storeOpt==null || !storeOpt.equals(opt)){
            throw new ValidationException("OTP has expired or is invalid");
        }
        existEmail.setVerified(true);
        existEmail.setVerificationStatus(VerificationStatus.VERIFIED);
        userRepository.save(existEmail);
        redisTemplate.delete(OTP_PREFIX+email);
    }



}
