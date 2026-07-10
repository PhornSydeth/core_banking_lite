package com.banking.core.lite.transaction.utils;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class TransactionRefGenerator {
    private static final String ALPHABET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM=new SecureRandom();
    private static final DateTimeFormatter DATE_FORMATTER=DateTimeFormatter.ofPattern("yyyyMMdd");
    public static String generateTransactionReference(){
        String date= LocalDate.now().format(DATE_FORMATTER);
        StringBuilder suffix=new StringBuilder(12);
        for (int i = 0; i <12 ; i++) {
            suffix.append(ALPHABET.charAt(RANDOM.nextInt((ALPHABET.length()))));

        }
        return "TXN-"+date + "-" + suffix.toString();
    }

}
