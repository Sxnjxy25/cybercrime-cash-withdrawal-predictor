def mask_pii(value: str, entity_type: str) -> str:
    """
    Mask sensitive financial & personal identifiers while keeping key ending characters visible.
    Example: 9876543210 -> XXXXXX3210, user@bankupi -> XXXX@bankupi
    """
    if not value:
        return "N/A"
    
    val = value.strip()
    if entity_type == "MOBILE_NUMBER":
        if len(val) >= 10:
            return "XXXXXX" + val[-4:]
        return "XXXX" + val[-2:]
    
    elif entity_type == "UPI_ID":
        parts = val.split("@")
        if len(parts) == 2:
            prefix = parts[0]
            masked_pref = prefix[0] + "XXX" + prefix[-1] if len(prefix) > 2 else "XXX"
            return f"{masked_pref}@{parts[1]}"
        return "XXX@upi"
    
    elif entity_type == "EMAIL":
        parts = val.split("@")
        if len(parts) == 2:
            name, domain = parts[0], parts[1]
            masked_name = name[0] + "***" + name[-1] if len(name) > 2 else "*"
            return f"{masked_name}@{domain}"
        return "*@domain.com"
    
    elif entity_type == "BANK_ACCOUNT":
        if len(val) >= 8:
            return "XXXX-XXXX-" + val[-4:]
        return "XXXX-" + val[-2:]
    
    elif entity_type == "DOMAIN_URL":
        # URLs are not sensitive PII, but sanitize if needed
        return val
    
    return "XXXX" + val[-4:] if len(val) >= 4 else "XXXX"
