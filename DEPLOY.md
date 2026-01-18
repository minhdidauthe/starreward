# Hướng Dẫn Triển Khai Hệ Thống Lên Google Cloud

Tài liệu này hướng dẫn bạn đưa ứng dụng "Star Reward" lên một máy chủ ảo (VPS) của Google Cloud.

## Phần 1: Tạo Máy Ảo (Virtual Machine)

1.  Truy cập **Google Cloud Console** (https://console.cloud.google.com/).
2.  Vào menu **Compute Engine** > **VM instances**.
3.  Nhấn **Create Instance**.
4.  Điền thông tin:
    *   **Name**: `star-reward-vps`
    *   **Region**: `asia-southeast1` (Singapore) hoặc `asia-east1` (Taiwan).
    *   **Machine type**: `e2-medium` (2 vCPU, 4GB memory).
    *   **Boot disk**: Chọn **CHANGE**, chọn **Operating System: Ubuntu**, **Version: Ubuntu 22.04 LTS**.
    *   **Firewall**: Tích chọn **Allow HTTP traffic** và **Allow HTTPS traffic**.
5.  Nhấn **Create**.

## Phần 2: Upload Code

1.  Nén code dự án (tại máy tính của bạn):
    ```bash
    # Tại thư mục dự án
    tar -czvf star_reward.tar.gz --exclude='venv' --exclude='instance' --exclude='__pycache__' .
    ```
2.  Trên Google Cloud Console, nhấn nút **SSH** cạnh tên VM vừa tạo.
3.  Trong cửa sổ SSH, chọn biểu tượng **Upload File** (góc trên bên phải) và chọn file `star_reward.tar.gz` vừa tạo.

## Phần 3: Cài Đặt Tự Động

Trong cửa sổ SSH:

1.  Giải nén code:
    ```bash
    mkdir star_reward_app
    tar -xzvf star_reward.tar.gz -C star_reward_app
    cd star_reward_app
    ```

2.  Chạy script cài đặt:
    ```bash
    sudo bash scripts/setup_vps.sh
    ```

## Phần 4: Hoàn Tất

Sau khi script chạy xong, bạn có thể truy cập web tại:
`http://<External_IP_Của_VPS>`
