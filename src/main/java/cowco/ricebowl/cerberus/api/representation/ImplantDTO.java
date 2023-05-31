package cowco.ricebowl.cerberus.api.representation;

import cowco.ricebowl.cerberus.db.ImplantEntity;

public class ImplantDTO {
    private String implantId;
    private String ip;
    private String os;
    private Long beaconIntervalSeconds;
    // TODO Should also output the isActive and lastCheckinTime vars

    public ImplantDTO(ImplantEntity dbEntity) {
        this.implantId = dbEntity.getImplantId();
        this.ip = dbEntity.getIp();
        this.os = dbEntity.getOs();
        this.beaconIntervalSeconds = dbEntity.getBeaconIntervalSeconds();
    }

    public String getImplantId() {
        return implantId;
    }

    public String getIp() {
        return ip;
    }

    public String getOs() {
        return os;
    }

    public Long getBeaconIntervalSeconds() {
        return beaconIntervalSeconds;
    }

}
