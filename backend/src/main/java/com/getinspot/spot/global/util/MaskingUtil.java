package com.getinspot.spot.global.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class MaskingUtil {

    public String maskName(String name) {
        if (name == null || name.length() < 2) return name;

        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1);
    }

    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 8) return phone;
        return phone.replaceAll("(\\d{3})-?(\\d{3,4})-?(\\d{4})", "$1-****-$3");
    }

    public String maskEmail(String email) {
        if (email == null || email.isBlank()) return email;

        int atIndex = email.indexOf("@");
        if (atIndex <= 0) return email;

        String localPart = email.substring(0, atIndex); // @ 앞부분 (아이디)
        String domainPart = email.substring(atIndex);   // @ 뒷부분 (도메인)
        int len = localPart.length();

        if (len >= 5) {
            String prefix = localPart.substring(0, 2);
            String suffix = localPart.substring(len - 2);
            String mask = "*".repeat(len - 4);

            return prefix + mask + suffix + domainPart;
        }

        if (len > 2) {
            return localPart.substring(0, 2) + "*".repeat(len - 2) + domainPart;
        }

        return localPart + domainPart;
    }
}
