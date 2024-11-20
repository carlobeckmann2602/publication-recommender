import logging
import os
import torch
import torch.nn as nn
import torch.nn.functional as functional
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from typing import Tuple

vae_logger = logging.getLogger(__name__)


class CustomDataset(Dataset):
    def __init__(self, data: torch.Tensor, latents: torch.Tensor):
        self.data = data.float()
        self.latents = latents.float()

    def __len__(self) -> int:
        return len(self.data)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.data[idx], self.latents[idx]


class VAE(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        super(VAE, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc21 = nn.Linear(hidden_dim, latent_dim)
        self.fc22 = nn.Linear(hidden_dim, latent_dim)
        self.fc3 = nn.Linear(latent_dim, hidden_dim)
        self.fc4 = nn.Linear(hidden_dim, input_dim)

    def encode(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        h1 = functional.relu(self.fc1(x))
        return self.fc21(h1), self.fc22(h1)

    def reparameterize(self, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        h3 = functional.relu(self.fc3(z))
        return torch.sigmoid(self.fc4(h3))

    def forward(
        self, x: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar


def loss_function(
    recon_x: torch.Tensor,
    x: torch.Tensor,
    mu: torch.Tensor,
    logvar: torch.Tensor,
    z_target: torch.Tensor,
    laten_weight: float = 1,
) -> tuple[torch.Tensor, torch.Tensor]:
    BCE = functional.binary_cross_entropy(recon_x, x, reduction="sum")
    KLD = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    latent_loss = functional.mse_loss(mu, z_target, reduction="sum")
    return (
        BCE + KLD + latent_loss * laten_weight,
        latent_loss * laten_weight,
    )


def train_vae(
    model: VAE,
    train_loader: DataLoader,
    epochs: int = 50,
    learning_rate: float = 1e-3,
    latent_weight: float = 1,
) -> None:
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    model.train()
    for epoch in range(epochs):
        train_loss = 0
        train_latent_loss = 0
        for data, z_target in train_loader:
            data = data.view(-1, model.fc1.in_features).float()
            z_target = z_target.float()
            optimizer.zero_grad()
            recon_batch, mu, logvar = model(data)
            loss, latent_loss = loss_function(
                recon_batch, data, mu, logvar, z_target, latent_weight
            )
            loss.backward()
            train_loss += loss.item()
            train_latent_loss += latent_loss.item()
            optimizer.step()
        vae_logger.info(
            f"VAE Train: Epoch {epoch + 1}, Loss: {train_loss / len(train_loader.dataset)}, Latent Loss: {train_latent_loss/ len(train_loader.dataset)}"
        )


def get_dataloader(
    x_train: torch.Tensor, z_train: torch.Tensor, batch_size: int = 128
) -> DataLoader:
    train_dataset = CustomDataset(x_train, z_train)
    return DataLoader(train_dataset, batch_size=batch_size, shuffle=True)


def save_model(
    model: VAE, file_name: str = "vae.pth", path: str = "./data/models"
) -> None:
    if not os.path.exists(path):
        os.makedirs(path)
    torch.save(model.state_dict(), f"{path}/{file_name}")


def load_model(
    model: VAE, file_name: str = "vae.pth", path: str = "./data/models"
) -> VAE:
    try:
        model.load_state_dict(torch.load(f"{path}/{file_name}"))
        model.eval()
        return model
    except FileNotFoundError:
        vae_logger.error("VAE model not found")
