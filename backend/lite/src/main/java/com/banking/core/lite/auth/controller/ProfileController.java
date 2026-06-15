package com.banking.core.lite.auth.controller;

import com.banking.core.lite.auth.dto.Profile;
import com.banking.core.lite.auth.entity.User;
import com.banking.core.lite.auth.service.MyCustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/test")
public class ProfileController {
    @GetMapping
    public String getTest(){
        return "Hello";
    }
    @GetMapping("/me")
    public ResponseEntity<Profile> profiler(@AuthenticationPrincipal MyCustomUserDetails user){
          Profile profile=new Profile();
          profile.setUserId(user.getUserId());
          profile.setUsername(user.getActualUsername());
          profile.setEmail(user.getEmail());
          profile.setVerified(user.isVerified());
        return ResponseEntity.ok(profile);
    }

}

