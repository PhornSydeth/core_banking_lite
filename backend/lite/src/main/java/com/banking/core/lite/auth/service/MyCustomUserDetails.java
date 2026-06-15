package com.banking.core.lite.auth.service;

import com.banking.core.lite.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

public class MyCustomUserDetails implements UserDetails {

    private final User user;

    public MyCustomUserDetails(User user) { this.user = user; }

    /** Returns the internal UUID — used ONLY server-side; never sent to the client. */
    public UUID getUserId() { return user.getId(); }

    public String getEmail() { return user.getEmail(); }

    public String getActualUsername() { return user.getUsername(); }

    public boolean isVerified() { return user.isVerified(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() { return user.getPassword(); }

    /** Returns email as the Spring Security principal name (used in authentication tokens). */
    @Override
    public String getUsername() { return user.getEmail(); }
}

